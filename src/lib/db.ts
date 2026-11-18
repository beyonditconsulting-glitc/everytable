import { promises as fs } from "fs";
import path from "path";
import type { Database } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const EMPTY_DB: Database = { stores: [], promoCodes: [] };

// Serializes writes within this process so concurrent requests don't clobber
// each other's changes to the JSON file.
let writeQueue: Promise<unknown> = Promise.resolve();

async function ensureFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(EMPTY_DB, null, 2));
  }
}

export async function readDb(): Promise<Database> {
  await ensureFile();
  const raw = await fs.readFile(DB_PATH, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return { stores: parsed.stores ?? [], promoCodes: parsed.promoCodes ?? [] };
  } catch {
    return { ...EMPTY_DB };
  }
}

async function writeDb(db: Database): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

export async function updateDb<T>(
  mutator: (db: Database) => T | Promise<T>
): Promise<T> {
  const task = writeQueue.then(async () => {
    const db = await readDb();
    const result = await mutator(db);
    await writeDb(db);
    return result;
  });
  writeQueue = task.catch(() => undefined);
  return task;
}
