# Huginn

Huginn is the `.cc` inspection and projection surface for CultCache state.

CultLib owns the CultCache implementation: document registration, MessagePack
payloads, schema catalogs, backing stores, and the canonical
`cultcache.store.v1` snapshot parser/writer. Huginn consumes that package and
turns `.cc`, `.msgpack`, or `.mpack` bytes into read-only operator surfaces.

## Current Shape

- `cultcache-ts` is loaded from `../CultLib/packages/cultcache-ts`
- `src/huginn-eve-dsl.ts` lowers a CultCache inspection into Eve DSL
- `inspector/` contains the local React/Norn visual inspector
- `electron/` packages the inspector as a desktop Huginn build
- Huginn does not write `.cc` files or decide CultCache persistence behavior

## Development

```sh
npm install
npm run build
npm run dev:inspector
```

Build the Vite inspector bundle:

```sh
npm run build:inspector
```

Build the desktop package:

```sh
npm run dist:inspector
```

Release builds must carry a new semantic version before any deployable artifact
is produced. While the package is pre-1.0, breaking public behavior increments
the minor version, compatible fixes increment the patch version, and the
generated Huginn executable must use that package version in its filename.

Huginn is read-only. Drop a `.cc`, `.msgpack`, or `.mpack` file onto the window
to inspect the snapshot header, schema catalog, records, decoded MessagePack
payload previews, and an Norn graph cloud of the file's structured payload data
without registering application schemas.
