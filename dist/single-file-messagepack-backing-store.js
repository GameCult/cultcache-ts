"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleFileMessagePackBackingStore = void 0;
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const msgpack_1 = require("@msgpack/msgpack");
const zod_1 = require("zod");
const envelopeSchema = zod_1.z.object({
    key: zod_1.z.string().min(1),
    type: zod_1.z.string().min(1),
    payload: zod_1.z.instanceof(Uint8Array),
    storedAt: zod_1.z.string().min(1),
});
const envelopeArraySchema = zod_1.z.array(envelopeSchema);
const legacyEnvelopeArraySchema = zod_1.z.array(zod_1.z.object({
    key: zod_1.z.string().min(1),
    type: zod_1.z.string().min(1),
    payload: zod_1.z.unknown(),
    storedAt: zod_1.z.string().min(1),
}));
const transientReplaceErrorCodes = new Set(["EBUSY", "EPERM", "EACCES"]);
class SingleFileMessagePackBackingStore {
    filePath;
    #writeQueue = Promise.resolve();
    constructor(filePath) {
        this.filePath = (0, node_path_1.resolve)(filePath);
    }
    async pullAll() {
        try {
            const data = await (0, promises_1.readFile)(this.filePath);
            const decoded = legacyEnvelopeArraySchema.parse((0, msgpack_1.decode)(data));
            let repairedLegacyPayload = false;
            const normalized = decoded.map((entry) => {
                const payload = normalizePayload(entry.payload);
                if (payload !== entry.payload) {
                    repairedLegacyPayload = true;
                }
                return {
                    ...entry,
                    payload,
                };
            });
            const parsed = envelopeArraySchema.parse(normalized);
            if (repairedLegacyPayload) {
                await this.#writeAll(parsed);
            }
            return parsed;
        }
        catch (error) {
            const code = error.code;
            if (code === "ENOENT") {
                return [];
            }
            throw error;
        }
    }
    async push(entry) {
        await this.#enqueue(async () => {
            const existing = await this.pullAll();
            const filtered = existing.filter((candidate) => !(candidate.type === entry.type && candidate.key === entry.key));
            filtered.push(entry);
            await this.#writeAll(filtered);
        });
    }
    async delete(entry) {
        await this.#enqueue(async () => {
            const existing = await this.pullAll();
            const filtered = existing.filter((candidate) => !(candidate.type === entry.type && candidate.key === entry.key));
            await this.#writeAll(filtered);
        });
    }
    async pushAll(entries, options = {}) {
        await this.#enqueue(async () => {
            if (options.soft) {
                try {
                    await (0, promises_1.readFile)(this.filePath);
                    return;
                }
                catch (error) {
                    const code = error.code;
                    if (code !== "ENOENT") {
                        throw error;
                    }
                }
            }
            await this.#writeAll(entries);
        });
    }
    async #enqueue(operation) {
        let result;
        const next = this.#writeQueue.then(async () => {
            result = await operation();
        });
        this.#writeQueue = next.then(() => undefined, () => undefined);
        await next;
        return result;
    }
    async #writeAll(entries) {
        await (0, promises_1.mkdir)((0, node_path_1.dirname)(this.filePath), { recursive: true });
        const tempPath = `${this.filePath}.tmp-${process.pid}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`;
        try {
            await (0, promises_1.writeFile)(tempPath, (0, msgpack_1.encode)(entries));
            await replaceFileWithRetry(tempPath, this.filePath);
        }
        catch (error) {
            await (0, promises_1.rm)(tempPath, { force: true }).catch(() => undefined);
            throw error;
        }
    }
}
exports.SingleFileMessagePackBackingStore = SingleFileMessagePackBackingStore;
async function replaceFileWithRetry(sourcePath, targetPath) {
    const delays = [25, 75, 150, 300, 600];
    let lastError;
    for (let attempt = 0; attempt <= delays.length; attempt += 1) {
        try {
            await (0, promises_1.rename)(sourcePath, targetPath);
            return;
        }
        catch (error) {
            lastError = error;
            if (!isTransientReplaceError(error) || attempt === delays.length) {
                break;
            }
            await delay(delays[attempt] ?? 0);
        }
    }
    if (isTransientReplaceError(lastError)) {
        try {
            await (0, promises_1.copyFile)(sourcePath, targetPath);
            await (0, promises_1.rm)(sourcePath, { force: true });
            return;
        }
        catch (copyError) {
            throw annotateReplaceError(copyError, sourcePath, targetPath);
        }
    }
    throw annotateReplaceError(lastError, sourcePath, targetPath);
}
function isTransientReplaceError(error) {
    return isErrnoException(error) &&
        typeof error.code === "string" &&
        transientReplaceErrorCodes.has(error.code);
}
function annotateReplaceError(error, sourcePath, targetPath) {
    if (error instanceof Error) {
        error.message = `CultCache failed to replace ${targetPath} from ${sourcePath}: ${error.message}`;
        return error;
    }
    return new Error(`CultCache failed to replace ${targetPath} from ${sourcePath}: ${String(error)}`);
}
function delay(milliseconds) {
    return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}
function normalizePayload(payload) {
    if (payload instanceof Uint8Array) {
        return payload;
    }
    if (isObject(payload) &&
        payload.type === "Buffer" &&
        Array.isArray(payload.data) &&
        payload.data.every((value) => Number.isInteger(value) && value >= 0 && value <= 255)) {
        return Uint8Array.from(payload.data);
    }
    if (Array.isArray(payload) && payload.every((value) => Number.isInteger(value) && value >= 0 && value <= 255)) {
        return Uint8Array.from(payload);
    }
    return (0, msgpack_1.encode)(payload);
}
function isObject(value) {
    return typeof value === "object" && value !== null;
}
function isErrnoException(error) {
    return typeof error === "object" && error !== null && "code" in error;
}
