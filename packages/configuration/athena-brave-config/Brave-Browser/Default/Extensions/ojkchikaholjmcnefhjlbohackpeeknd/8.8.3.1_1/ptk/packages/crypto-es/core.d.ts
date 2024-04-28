/**
 * Base class for inheritance.
 */
export class Base {
    /**
     * Extends this object and runs the init method.
     * Arguments to create() will be passed to init().
     *
     * @return {Object} The new object.
     *
     * @static
     *
     * @example
     *
     *     var instance = MyType.create();
     */
    static create(...args: any[]): Base;
    /**
     * Copies properties into this object.
     *
     * @param {Object} properties The properties to mix in.
     *
     * @example
     *
     *     MyType.mixIn({
     *         field: 'value'
     *     });
     */
    mixIn(properties: object): Base;
    /**
     * Creates a copy of this object.
     *
     * @return {Object} The clone.
     *
     * @example
     *
     *     var clone = instance.clone();
     */
    clone(): Base;
}
/**
 * An array of 32-bit words.
 *
 * @property {Array} words The array of 32-bit words.
 * @property {number} sigBytes The number of significant bytes in this word array.
 */
export class WordArray extends Base {
    /**
     * Creates a word array filled with random bytes.
     *
     * @param {number} nBytes The number of random bytes to generate.
     *
     * @return {WordArray} The random word array.
     *
     * @static
     *
     * @example
     *
     *     var wordArray = CryptoJS.lib.WordArray.random(16);
     */
    static random(nBytes: number): WordArray;
    /**
     * Initializes a newly created word array.
     *
     * @param {Array} words (Optional) An array of 32-bit words.
     * @param {number} sigBytes (Optional) The number of significant bytes in the words.
     *
     * @example
     *
     *     var wordArray = CryptoJS.lib.WordArray.create();
     *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
     *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
     */
    static create(
        words?: Array<number> | ArrayBuffer | Uint8Array | Int8Array | Uint8ClampedArray
        | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array,
        sigBytes?: number,
    ): WordArray;
    constructor(
        words?: Array<number> | ArrayBuffer | Uint8Array | Int8Array | Uint8ClampedArray
        | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array,
        sigBytes?: number,
    );
    words: Array<number>;
    sigBytes: number;
    /**
     * Converts this word array to a string.
     *
     * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
     *
     * @return {string} The stringified word array.
     *
     * @example
     *
     *     var string = wordArray + '';
     *     var string = wordArray.toString();
     *     var string = wordArray.toString(CryptoJS.enc.Utf8);
     */
    toString(encoder?: Encoder): string;
    /**
     * Concatenates a word array to this word array.
     *
     * @param {WordArray} wordArray The word array to append.
     *
     * @return {WordArray} This word array.
     *
     * @example
     *
     *     wordArray1.concat(wordArray2);
     */
    concat(wordArray: WordArray): WordArray;
    /**
     * Removes insignificant bits.
     *
     * @example
     *
     *     wordArray.clamp();
     */
    clamp(): void;
    /**
     * Creates a copy of this word array.
     *
     * @return {WordArray} The clone.
     *
     * @example
     *
     *     var clone = wordArray.clone();
     */
    clone(): WordArray;
}
export interface Encoder {
    stringify(wordArray: WordArray): string;
    parse(str: string): WordArray;
}
export const Hex: Encoder;
export const Latin1: Encoder;
export const Utf8: Encoder;
/**
 * Abstract buffered block algorithm template.
 *
 * The property blockSize must be implemented in a concrete subtype.
 *
 * @property {number} _minBufferSize
 *
 *     The number of blocks that should be kept unprocessed in the buffer. Default: 0
 */
export class BufferedBlockAlgorithm extends Base {
    _minBufferSize: number;
    /**
     * Resets this block algorithm's data buffer to its initial state.
     *
     * @example
     *
     *     bufferedBlockAlgorithm.reset();
     */
    reset(): void;
    _data: WordArray;
    _nDataBytes: number;
    /**
     * Adds new data to this block algorithm's buffer.
     *
     * @param {WordArray|string} data
     *
     *     The data to append. Strings are converted to a WordArray using UTF-8.
     *
     * @example
     *
     *     bufferedBlockAlgorithm._append('data');
     *     bufferedBlockAlgorithm._append(wordArray);
     */
    _append(data: WordArray | string): void;
    /**
     * Processes available data blocks.
     *
     * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
     *
     * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
     *
     * @return {WordArray} The processed data.
     *
     * @example
     *
     *     var processedData = bufferedBlockAlgorithm._process();
     *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
     */
    _process(doFlush?: boolean): WordArray;
    /**
     * Creates a copy of this object.
     *
     * @return {Object} The clone.
     *
     * @example
     *
     *     var clone = bufferedBlockAlgorithm.clone();
     */
    clone(): BufferedBlockAlgorithm;
}
export interface HasherCfg {
    // SHA3
    outputLength?: number
}
export type HashFn = (message: WordArray | string, cfg?: HasherCfg) => WordArray;
export type HMACHashFn = (message: WordArray | string, key: WordArray | string) => WordArray;
/**
 * Abstract hasher template.
 *
 * @property {number} blockSize
 *
 *     The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
 */
export class Hasher extends BufferedBlockAlgorithm {
    /**
     * Creates a shortcut function to a hasher's object interface.
     *
     * @param {Hasher} SubHasher The hasher to create a helper for.
     *
     * @return {Function} The shortcut function.
     *
     * @static
     *
     * @example
     *
     *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
     */
    static _createHelper(SubHasher: Hasher): HashFn;
    /**
     * Creates a shortcut function to the HMAC's object interface.
     *
     * @param {Hasher} SubHasher The hasher to use in this HMAC helper.
     *
     * @return {Function} The shortcut function.
     *
     * @static
     *
     * @example
     *
     *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
     */
    static _createHmacHelper(SubHasher: Hasher): HMACHashFn;
    static create(cfg?: HasherCfg): Hasher;
    constructor(cfg?: HasherCfg);
    blockSize: number;
    /**
     * Configuration options.
     */
    cfg: Base;
    /**
     * Updates this hasher with a message.
     *
     * @param {WordArray|string} messageUpdate The message to append.
     *
     * @return {Hasher} This hasher.
     *
     * @example
     *
     *     hasher.update('message');
     *     hasher.update(wordArray);
     */
    update(messageUpdate: WordArray | string): Hasher;
    /**
     * Finalizes the hash computation.
     * Note that the finalize operation is effectively a destructive, read-once operation.
     *
     * @param {WordArray|string} messageUpdate (Optional) A final message update.
     *
     * @return {WordArray} The hash.
     *
     * @example
     *
     *     var hash = hasher.finalize();
     *     var hash = hasher.finalize('message');
     *     var hash = hasher.finalize(wordArray);
     */
    finalize(messageUpdate?: WordArray | string): WordArray;
    _doReset(): void;
    _hash: WordArray;
    _doProcessBlock(M: number[], offset: number): void;
    _doFinalize(): WordArray;
}
/**
 * HMAC algorithm.
 */
export class HMAC extends Base {
    /**
     * Initializes a newly created HMAC.
     *
     * @param {Hasher} SubHasher The hash algorithm to use.
     * @param {WordArray|string} key The secret key.
     *
     * @example
     *
     *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
     */
    static create(SubHasher: Function, key: WordArray | string): HMAC;
    constructor(SubHasher: Function, key: WordArray | string);
    _hasher: Hasher;
    _oKey: WordArray;
    _iKey: WordArray;
    /**
     * Resets this HMAC to its initial state.
     *
     * @example
     *
     *     hmacHasher.reset();
     */
    reset(): void;
    /**
     * Updates this HMAC with a message.
     *
     * @param {WordArray|string} messageUpdate The message to append.
     *
     * @return {HMAC} This HMAC instance.
     *
     * @example
     *
     *     hmacHasher.update('message');
     *     hmacHasher.update(wordArray);
     */
    update(messageUpdate: WordArray | string): HMAC;
    /**
     * Finalizes the HMAC computation.
     * Note that the finalize operation is effectively a destructive, read-once operation.
     *
     * @param {WordArray|string} messageUpdate (Optional) A final message update.
     *
     * @return {WordArray} The HMAC.
     *
     * @example
     *
     *     var hmac = hmacHasher.finalize();
     *     var hmac = hmacHasher.finalize('message');
     *     var hmac = hmacHasher.finalize(wordArray);
     */
    finalize(messageUpdate?: WordArray | string): WordArray;
}
export interface KDFCfg {
    // EvpKDF
    keySize?: number;
    hasher?: Function;
    iterations?: number;
}
export type KDFFn = (password: WordArray | string, salt: WordArray | string, cfg?: KDFCfg) => WordArray;
