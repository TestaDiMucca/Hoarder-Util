import { PrismaClient } from '@prisma/client';

export const db = new PrismaClient();

export const disconnectPrisma = () => db.$disconnect();
