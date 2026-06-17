import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

let bootstrapped = false;

export async function ensureDatabase() {
  if (bootstrapped) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Analysis" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "token" TEXT NOT NULL,
      "resumeText" TEXT,
      "jobDescriptionText" TEXT,
      "analysisJson" JSONB NOT NULL,
      "paidStatus" BOOLEAN NOT NULL DEFAULT false,
      "paymentProvider" TEXT,
      "paymentSessionId" TEXT,
      "paymentOrderId" TEXT,
      "paymentStatus" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "expiresAt" DATETIME NOT NULL
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Analysis_token_key" ON "Analysis"("token");`);
  await addColumnIfMissing("Analysis", "paymentProvider", "TEXT");
  await addColumnIfMissing("Analysis", "paymentSessionId", "TEXT");
  await addColumnIfMissing("Analysis", "paymentOrderId", "TEXT");
  await addColumnIfMissing("Analysis", "paymentStatus", "TEXT");
  bootstrapped = true;
}

async function addColumnIfMissing(table: string, column: string, definition: string) {
  const columns = (await prisma.$queryRawUnsafe(`PRAGMA table_info("${table}")`)) as Array<{ name: string }>;
  if (!columns.some((item) => item.name === column)) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${definition}`);
  }
}
