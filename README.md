# Huginn

Huginn reads CultCache `.cc` state and emits Eve DSL.

CultLib owns the CultCache implementation: document registration, MessagePack
payloads, schema catalogs, backing stores, and the canonical
`cultcache.store.v1` snapshot parser/writer. Huginn consumes CultLib's
`cultcache-ts/inspection` surface and projects inspection results into UI
documents that Eve-capable runtimes can lower.

## Authority

- Owner: Huginn owns `.cc` inspection projection, not `.cc` persistence.
- Input: `.cc`, `.msgpack`, or `.mpack` bytes readable by CultLib.
- Output: Eve DSL for `cultcache.huginn.inspector`.
- Renderers: browser, native, overlay, TUI, or future rooms lower the emitted
  DSL without becoming state owners.

There is no Electron app, Vite dashboard, React renderer, or Norn-owned
presentation path in this repo. If a runtime wants to display Huginn, it should
consume the emitted Eve DSL.

## CLI

```sh
npm install
npm run build
npx huginn path/to/state.cc > huginn.eve
```

The CLI writes Eve DSL to stdout and errors to stderr.

## API

```ts
import { inspectCultCacheBytes, buildHuginnEveDsl } from "@gamecult/huginn";

const inspection = inspectCultCacheBytes(filePath, bytes);
const eveDsl = buildHuginnEveDsl(inspection);
```
