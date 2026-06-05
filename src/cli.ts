#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { inspectCultCacheBytes } from "cultcache-ts/inspection";

import { buildHuginnEveDsl } from "./huginn-eve-dsl";

async function main(args: string[]): Promise<void> {
  const filePath = args[0];
  if (!filePath || args.includes("--help") || args.includes("-h")) {
    process.stderr.write("Usage: huginn <state.cc|state.msgpack|state.mpack>\n");
    process.exitCode = filePath ? 0 : 1;
    return;
  }

  const bytes = await readFile(filePath);
  const inspection = inspectCultCacheBytes(filePath, bytes);
  process.stdout.write(`${buildHuginnEveDsl(inspection)}\n`);
}

void main(process.argv.slice(2)).catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
