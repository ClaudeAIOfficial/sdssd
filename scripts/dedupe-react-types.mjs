// Some transitive dependencies (react-native, pulled in by the Solana mobile
// wallet adapter) install their own nested copy of `@types/react@19`. When the
// TypeScript compiler resolves the wallet adapter's declaration files it picks
// up that nested v19 copy, whose `ReactNode` (with the async-component Promise
// variant) clashes with our React 18 setup and breaks `next build`.
//
// This script removes any nested `@types/react` / `@types/react-dom` copies so
// resolution always falls back to the single pinned v18 copy at the project
// root. It runs automatically via the `postinstall` npm hook, keeping the
// one-command setup (`npm install && npm run dev`) reliable.

import { readdirSync, rmSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const TARGETS = new Set(["react", "react-dom"]);
let removed = 0;

function walk(dir, depth) {
  if (depth > 8) return;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const full = join(dir, entry.name);
    if (entry.name === "node_modules") {
      const typesDir = join(full, "@types");
      if (existsSync(typesDir)) {
        for (const target of TARGETS) {
          const p = join(typesDir, target);
          // Never touch the root-level @types copies.
          if (p === join(ROOT, "node_modules", "@types", target)) continue;
          try {
            if (statSync(p).isDirectory()) {
              rmSync(p, { recursive: true, force: true });
              removed++;
            }
          } catch {
            /* not present */
          }
        }
      }
      walk(full, depth + 1);
    } else {
      walk(full, depth + 1);
    }
  }
}

const base = join(ROOT, "node_modules");
if (existsSync(base)) {
  walk(base, 0);
}
if (removed > 0) {
  console.log(`[gts] Removed ${removed} nested @types/react(-dom) copy(ies) to keep React 18 types consistent.`);
}
