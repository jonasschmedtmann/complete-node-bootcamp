"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decompress = exports.compress = exports.uncompressibleCommands = exports.Compressor = void 0;
const util_1 = require("util");
const zlib = require("zlib");
const constants_1 = require("../../constants");
const deps_1 = require("../../deps");
const error_1 = require("../../error");
/** @public */
exports.Compressor = Object.freeze({
    none: 0,
    snappy: 1,
    zlib: 2,
    zstd: 3
});
exports.uncompressibleCommands = new Set([
    constants_1.LEGACY_HELLO_COMMAND,
    'saslStart',
    'saslContinue',
    'getnonce',
    'authenticate',
    'createUser',
    'updateUser',
    'copydbSaslStart',
    'copydbgetnonce',
    'copydb'
]);
const ZSTD_COMPRESSION_LEVEL = 3;
const zlibInflate = (0, util_1.promisify)(zlib.inflate.bind(zlib));
const zlibDeflate = (0, util_1.promisify)(zlib.deflate.bind(zlib));
let zstd;
let Snappy = null;
function loadSnappy() {
    if (Snappy == null) {
        const snappyImport = (0, deps_1.getSnappy)();
        if ('kModuleError' in snappyImport) {
            throw snappyImport.kModuleError;
        }
        Snappy = snappyImport;
    }
    return Snappy;
}
// Facilitate compressing a message using an agreed compressor
async function compress(options, dataToBeCompressed) {
    const zlibOptions = {};
    switch (options.agreedCompressor) {
        case 'snappy': {
            Snappy ?? (Snappy = loadSnappy());
            return Snappy.compress(dataToBeCompressed);
        }
        case 'zstd': {
            loadZstd();
            if ('kModuleError' in zstd) {
                throw zstd['kModuleError'];
            }
            return zstd.compress(dataToBeCompressed, ZSTD_COMPRESSION_LEVEL);
        }
        case 'zlib': {
            if (options.zlibCompressionLevel) {
                zlibOptions.level = options.zlibCompressionLevel;
            }
            return zlibDeflate(dataToBeCompressed, zlibOptions);
        }
        default: {
            throw new error_1.MongoInvalidArgumentError(`Unknown compressor ${options.agreedCompressor} failed to compress`);
        }
    }
}
exports.compress = compress;
// Decompress a message using the given compressor
async function decompress(compressorID, compressedData) {
    if (compressorID !== exports.Compressor.snappy &&
        compressorID !== exports.Compressor.zstd &&
        compressorID !== exports.Compressor.zlib &&
        compressorID !== exports.Compressor.none) {
        throw new error_1.MongoDecompressionError(`Server sent message compressed using an unsupported compressor. (Received compressor ID ${compressorID})`);
    }
    switch (compressorID) {
        case exports.Compressor.snappy: {
            Snappy ?? (Snappy = loadSnappy());
            return Snappy.uncompress(compressedData, { asBuffer: true });
        }
        case exports.Compressor.zstd: {
            loadZstd();
            if ('kModuleError' in zstd) {
                throw zstd['kModuleError'];
            }
            return zstd.decompress(compressedData);
        }
        case exports.Compressor.zlib: {
            return zlibInflate(compressedData);
        }
        default: {
            return compressedData;
        }
    }
}
exports.decompress = decompress;
/**
 * Load ZStandard if it is not already set.
 */
function loadZstd() {
    if (!zstd) {
        zstd = (0, deps_1.getZstdLibrary)();
    }
}
//# sourceMappingURL=compression.js.map