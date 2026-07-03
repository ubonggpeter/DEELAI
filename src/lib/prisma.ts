import { PrismaClient } from "@prisma/client";

const g = global as typeof global & { prisma?: PrismaClient };
if (!g.prisma) {
  g.prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
  });
}
export const prisma = g.prisma;
