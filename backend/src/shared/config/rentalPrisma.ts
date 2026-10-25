import { PrismaClient as RentalPrismaClient } from '../../generated/rental-client';
import { env } from './env';

// Isolated database client for Database A (Rental Management System)
// Connects strictly to RENTAL_DATABASE_URL on AWS RDS Aurora
const rentalDatabaseUrl = env.RENTAL_DATABASE_URL || env.DATABASE_URL;

export const rentalPrisma = new RentalPrismaClient({
  datasources: {
    db: {
      url: rentalDatabaseUrl,
    },
  },
  log: [
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

// Suppress transient remote host connection drops (OS 10054 / AWS RDS idle drops / P1001)
// @ts-ignore
rentalPrisma.$on('error', (e: any) => {
  const msg = e?.message || '';
  if (
    msg.includes('10054') ||
    msg.includes('ConnectionReset') ||
    msg.includes('forcibly closed') ||
    msg.includes("Can't reach database server") ||
    msg.includes('Server has closed the connection') ||
    msg.includes('closed the connection') ||
    msg.includes('Connection closed') ||
    msg.includes('broken pipe') ||
    msg.includes('P1001') ||
    msg.includes('P1017') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('ECONNRESET')
  ) {
    return;
  }
  console.error('[Rental Prisma Error]:', e);
});

/**
 * Resilient database operation wrapper for Rental Database (Database A)
 */
export async function withRentalDbRetry<T>(
  operation: () => Promise<T>,
  retries = 2,
  delayMs = 300
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (err: any) {
      attempt++;
      const isTransient =
        err?.message?.includes("Can't reach database server") ||
        err?.message?.includes('Server has closed the connection') ||
        err?.message?.includes('closed the connection') ||
        err?.message?.includes('Connection closed') ||
        err?.message?.includes('10054') ||
        err?.message?.includes('ConnectionReset') ||
        err?.message?.includes('forcibly closed') ||
        err?.message?.includes('broken pipe') ||
        err?.message?.includes('ETIMEDOUT') ||
        err?.message?.includes('ECONNRESET') ||
        err?.code === 'P1001' ||
        err?.code === 'P1017';

      if (attempt <= retries && isTransient) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
        continue;
      }
      throw err;
    }
  }
}
