import { PrismaClient } from '@/generated/prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL ?? '';

  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    // Production: Neon serverless Postgres
    const { Pool, neonConfig } = require('@neondatabase/serverless');
    const { PrismaNeon } = require('@prisma/adapter-neon');
    const ws = require('ws');
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter });
  } else {
    // Local dev: SQLite via better-sqlite3
    const path = require('path');
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
    const filePath = path.resolve((dbUrl || 'file:./dev.db').replace(/^file:/, ''));
    const adapter = new PrismaBetterSqlite3({ url: filePath });
    return new PrismaClient({ adapter });
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
