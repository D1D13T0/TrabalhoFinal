import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client";
import { env } from "../config/env";

const adapter = new PrismaBetterSqlite3({ url: env.databaseUrl });

// Instância única do Prisma usada por todos os DAOs.
export const prisma = new PrismaClient({ adapter });
