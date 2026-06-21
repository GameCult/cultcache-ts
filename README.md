# Huginn

Huginn reads CultCache `.cc` state and emits Eve DSL for inspectable witness
surfaces.

CultLib owns the CultCache implementation: document registration, MessagePack
payloads, schema catalogs, backing stores, and the canonical
`cultcache.store.v1` snapshot parser/writer. Huginn consumes CultLib's
`cultcache-ts/inspection` surface and projects inspection results into UI
documents that Eve-capable runtimes can lower.

Upstream: `https://github.com/GameCult/Huginn.git`

## Authority

- Owner: Huginn owns `.cc` inspection projection, not `.cc` persistence.
- Input: `.cc`, `.msgpack`, or `.mpack` bytes readable by CultLib.
- Output: Eve DSL for `cultcache.huginn.inspector`.
- Renderers: browser, native, overlay, TUI, or future rooms lower the emitted
  DSL without becoming state owners.

There is no Electron app, Vite dashboard, React renderer, or Norn-owned
presentation path in this repo. If a runtime wants to display Huginn, it should
consume the emitted Eve DSL.

## Witness Contract

Huginn's useful first artifact is not a dashboard. It is a read-only specimen
tray for typed state:

- which file was inspected
- which CultCache format decoded
- which schema/catalog entry owns each record
- what payload preview survived decoding
- which failure state stayed visible instead of being polished away

The inspector may make evidence easier to read. It must not mutate canonical
bytes, bless missing schemas, or let a renderer become the source of truth.

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

## Persona And Epiphany

Huginn has a repo Persona under `.voidbot/voice`. The Persona's current
jurisdiction is this repository body, `E:\Projects\Huginn`, and its useful
pressure is simple: return from the world with evidence, not vibes.

Epiphany wiring has been smoke-tested through the repo front doors:

```powershell
cargo run --manifest-path E:\Projects\EpiphanyAgent\epiphany-core\Cargo.toml --bin epiphany-repo -- init --workspace E:\Projects\Huginn
cargo run --manifest-path E:\Projects\EpiphanyAgent\epiphany-core\Cargo.toml --bin epiphany-swarm -- online --workspace E:\Projects\Huginn
```

Live fire should happen on an `epiphany/*` or `codex/*` workbench branch.
Publication to `main` remains a maintainer/Bifrost decision, not something the
inspection projection owns.
