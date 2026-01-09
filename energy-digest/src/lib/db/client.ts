import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import type { Database as SqliteDatabase } from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";

type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

declare global {
  var __db__: DrizzleClient | undefined;
}

const dbFile = process.env.DATABASE_URL?.replace("file:", "") ??
  path.join(process.cwd(), "drizzle", "db.sqlite");

function prepareDatabaseFile() {
  const dir = path.dirname(dbFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, "");
  }
}

function ensureSchema(sqlite: SqliteDatabase) {
  const bootstrapFile = path.join(process.cwd(), "drizzle", "0000_initial.sql");
  if (fs.existsSync(bootstrapFile)) {
    const sql = fs.readFileSync(bootstrapFile, "utf8");
    sqlite.exec(sql);
  }
}

export function getDb() {
  if (global.__db__) {
    return global.__db__;
  }

  prepareDatabaseFile();
  const sqlite = new Database(dbFile);
  sqlite.pragma("journal_mode = WAL");
  ensureSchema(sqlite);
  const db = drizzle(sqlite, { schema });

  global.__db__ = db;
  return db;
}

export type DatabaseClient = ReturnType<typeof getDb>;
