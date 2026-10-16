import { PrismaClient } from '@prisma/client';
import { env } from './env';

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

// Suppress transient remote host connection drops (OS 10054 / AWS RDS idle drops / P1001 / Stale pool socket drops)
// Prisma automatically re-establishes the connection on subsequent queries
// @ts-ignore
prisma.$on('error', (e: any) => {
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
    // Suppressed transient network/idle pool blip — automatically handled by withDbRetry
    return;
  }
  console.error('[Prisma Error]:', e);
});

// Periodic lightweight keep-alive to keep the AWS RDS TCP connection warm
const keepAliveInterval = setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    // Handled automatically on next query
  }
}, 30000);

if (keepAliveInterval.unref) {
  keepAliveInterval.unref();
}

/**
 * Resilient database operation wrapper with automatic retry for transient cloud/network drops
 */
export async function withDbRetry<T>(
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
