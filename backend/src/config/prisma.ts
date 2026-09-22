import { PrismaClient } from '@prisma/client';
import { env } from './env';

const isProduction = env.NODE_ENV === 'production';

export const prisma = new PrismaClient({
  log: isProduction ? ['warn', 'error'] : ['query', 'info', 'warn', 'error'],
});
