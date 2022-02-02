"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readBigUInt64LE = exports.readBigInt64LE = void 0;
// https://github.com/nodejs/node/blob/v14.17.0/lib/internal/errors.js#L758
var ERR_BUFFER_OUT_OF_BOUNDS = function () { return new Error('Attempt to access memory outside buffer bounds'); };
// https://github.com/nodejs/node/blob/v14.17.0/lib/internal/errors.js#L968
var ERR_INVALID_ARG_TYPE = function (name, expected, actual) {
    return new Error("The \"" + name + "\" argument must be of type " + expected + ". Received " + actual);
};
// https://github.com/nodejs/node/blob/v14.17.0/lib/internal/errors.js#L1262
var ERR_OUT_OF_RANGE = function (str, range, received) {
    return new Error("The value of \"" + str + " is out of range. It must be " + range + ". Received " + received);
};
// https://github.com/nodejs/node/blob/v14.17.0/lib/internal/validators.js#L127-L130
function validateNumber(value, name) {
    if (typeof value !== 'number')
        throw ERR_INVALID_ARG_TYPE(name, 'number', value);
}
// https://github.com/nodejs/node/blob/v14.17.0/lib/internal/buffer.js#L68-L80
function boundsError(value, length) {
    if (Math.floor(value) !== value) {
        validateNumber(value, 'offset');
        throw ERR_OUT_OF_RANGE('offset', 'an integer', value);
    }
    if (length < 0)
        throw ERR_BUFFER_OUT_OF_BOUNDS();
    throw ERR_OUT_OF_RANGE('offset', ">= 0 and <= " + length, value);
}
// https://github.com/nodejs/node/blob/v14.17.0/lib/internal/buffer.js#L129-L145
function readBigInt64LE(buffer, offset) {
    if (offset === void 0) { offset = 0; }
    validateNumber(offset, 'offset');
    var first = buffer[offset];
    var last = buffer[offset + 7];
    if (first === undefined || last === undefined)
        boundsError(offset, buffer.length - 8);
    // tslint:disable-next-line:no-bitwise
    var val = buffer[offset + 4] + buffer[offset + 5] * Math.pow(2, 8) + buffer[offset + 6] * Math.pow(2, 16) + (last << 24); // Overflow
    return ((BigInt(val) << BigInt(32)) + // tslint:disable-line:no-bitwise
        BigInt(first + buffer[++offset] * Math.pow(2, 8) + buffer[++offset] * Math.pow(2, 16) + buffer[++offset] * Math.pow(2, 24)));
}
exports.readBigInt64LE = readBigInt64LE;
// https://github.com/nodejs/node/blob/v14.17.0/lib/internal/buffer.js#L89-L107
function readBigUInt64LE(buffer, offset) {
    if (offset === void 0) { offset = 0; }
    validateNumber(offset, 'offset');
    var first = buffer[offset];
    var last = buffer[offset + 7];
    if (first === undefined || last === undefined)
        boundsError(offset, buffer.length - 8);
    var lo = first + buffer[++offset] * Math.pow(2, 8) + buffer[++offset] * Math.pow(2, 16) + buffer[++offset] * Math.pow(2, 24);
    var hi = buffer[++offset] + buffer[++offset] * Math.pow(2, 8) + buffer[++offset] * Math.pow(2, 16) + last * Math.pow(2, 24);
    return BigInt(lo) + (BigInt(hi) << BigInt(32)); // tslint:disable-line:no-bitwise
}
exports.readBigUInt64LE = readBigUInt64LE;
