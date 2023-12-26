"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bidirectional_l = exports.bidirectional_r_al = exports.prohibited_characters = exports.non_ASCII_space_characters = exports.commonly_mapped_to_nothing = exports.unassigned_code_points = void 0;
const sparse_bitfield_1 = __importDefault(require("sparse-bitfield"));
const code_points_data_1 = __importDefault(require("./code-points-data"));
let offset = 0;
function read() {
    const size = code_points_data_1.default.readUInt32BE(offset);
    offset += 4;
    const codepoints = code_points_data_1.default.slice(offset, offset + size);
    offset += size;
    return (0, sparse_bitfield_1.default)({ buffer: codepoints });
}
exports.unassigned_code_points = read();
exports.commonly_mapped_to_nothing = read();
exports.non_ASCII_space_characters = read();
exports.prohibited_characters = read();
exports.bidirectional_r_al = read();
exports.bidirectional_l = read();
//# sourceMappingURL=memory-code-points.js.map