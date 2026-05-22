import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("postgresql-orm");

const configPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../orm.config.json",
);

export const db = createClient({ configPath });
await db.$connect();
