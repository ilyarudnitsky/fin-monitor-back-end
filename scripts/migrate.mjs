import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { runMigrations } = require("postgresql-orm/migrate");

const configPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../orm.config.json",
);

await runMigrations(configPath);
console.log("Migrations applied.");
