#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("node:fs/promises");
const inspection_1 = require("cultcache-ts/inspection");
const huginn_eve_dsl_1 = require("./huginn-eve-dsl");
async function main(args) {
    const filePath = args[0];
    if (!filePath || args.includes("--help") || args.includes("-h")) {
        process.stderr.write("Usage: huginn <state.cc|state.msgpack|state.mpack>\n");
        process.exitCode = filePath ? 0 : 1;
        return;
    }
    const bytes = await (0, promises_1.readFile)(filePath);
    const inspection = (0, inspection_1.inspectCultCacheBytes)(filePath, bytes);
    process.stdout.write(`${(0, huginn_eve_dsl_1.buildHuginnEveDsl)(inspection)}\n`);
}
void main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
});
