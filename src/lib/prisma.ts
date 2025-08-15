import { PrismaClient } from '@prisma/client'

// Ensure a single PrismaClient instance in dev to avoid hot-reload leaks
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
