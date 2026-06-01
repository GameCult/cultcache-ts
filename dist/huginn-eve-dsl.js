"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildHuginnEveDsl = buildHuginnEveDsl;
function buildHuginnEveDsl(inspection) {
    return [
        "# Huginn emits Eve DSL. Renderers compile and lower it.",
        `surface cultcache.huginn.inspector ${quoteDsl("Huginn .cc Inspector")}`,
        "version 1",
        "",
        "collection huginn.catalog.entries",
        ...inspection.catalog.map((entry) => `item huginn.catalog.entries ${quoteDsl(renderCatalogEntry(entry))}`),
        "",
        "collection huginn.records.entries",
        ...inspection.records.map((record) => `item huginn.records.entries ${quoteDsl(renderRecord(record))}`),
        "",
        "card source \"Source Witness\"",
        `text ${quoteDsl(`file: ${inspection.filePath}`)}`,
        `text ${quoteDsl(`format: ${inspection.format}`)}`,
        `text ${quoteDsl(`bytes: ${inspection.fileSizeBytes}`)}`,
        "text \".cc bytes are authority; Huginn only emits Eve DSL.\"",
        "end",
        "",
        "card catalog \"Schema Catalog\"",
        `text ${quoteDsl(`schemas: ${inspection.catalog.length}`)}`,
        "list \"Catalog Entries\" bind huginn.catalog.entries",
        "end",
        "",
        "card records \"Persisted Records\"",
        `text ${quoteDsl(`records: ${inspection.records.length}`)}`,
        "list \"Record Entries\" bind huginn.records.entries",
        "end",
        "",
    ].join("\n");
}
function renderCatalogEntry(entry) {
    return [
        entry.schemaName,
        entry.schemaVersion,
        entry.schemaId,
        `${entry.members.length} members`,
    ].join(" | ");
}
function renderRecord(record) {
    const status = record.payloadDecodeError ? `decode error: ${record.payloadDecodeError}` : "decoded";
    return [
        record.key,
        record.schemaName,
        record.storedAt,
        `${record.payloadBytes} bytes`,
        status,
    ].join(" | ");
}
function quoteDsl(value) {
    return JSON.stringify(value);
}
