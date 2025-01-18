export interface CipherCfg {
    // Cipher
    iv?: WordArray;
    mode?: Function;
    padding?: Padding;
    // SerializableCipher
    format?: Format;
    // PasswordBasedCipher
    kdf?: Kdf;
    salt?: WordArray | string;
    hasher?: Function;
    // RC4Drop
    drop?: number;
}
export interface CipherObj {
    encrypt(message: WordArray | string, key: WordArray | string, cfg?: CipherCfg): CipherParams;
    decrypt(ciphertext: CipherParams | CipherParamsCfg | string, key: WordArray | string, cfg?: CipherCfg): WordArray;
}
/**
 * Abstract base cipher template.
 *
 * @property {number} keySize This cipher's key size. Default: 4 (128 bits)
 * @property {number} ivSize This cipher's IV size. Default: 4 (128 bits)
 * @property {number} _ENC_XFORM_MODE A constant representing encryption mode.
 * @property {number} _DEC_XFORM_MODE A constant representing decryption mode.
 */
export class Cipher extends BufferedBlockAlgorithm {
    static keySize: number;
    static ivSize: number;
    static _ENC_XFORM_MODE: number;
    static _DEC_XFORM_MODE: number;
    blockSize: number;
    /**
     * Creates this cipher in encryption mode.
     *
     * @param {WordArray} key The key.
     * @param {Object} cfg (Optional) The configuration options to use for this operation.
     *
     * @return {Cipher} A cipher instance.
     *
     * @static
     *
     * @example
     *
     *     const cipher = CryptoJS.algo.AES.createEncryptor(keyWordArray, { iv: ivWordArray });
     */
    static createEncryptor(key: WordArray, cfg?: CipherCfg): Cipher;
    /**
     * Creates this cipher in decryption mode.
     *
     * @param {WordArray} key The key.
     * @param {Object} cfg (Optional) The configuration options to use for this operation.
     *
     * @return {Cipher} A cipher instance.
     *
     * @static
     *
     * @example
     *
     *     const cipher = CryptoJS.algo.AES.createDecryptor(keyWordArray, { iv: ivWordArray });
     */
    static createDecryptor(key: WordArray, cfg?: CipherCfg): Cipher;
    /**
     * Creates shortcut functions to a cipher's object interface.
     *
     * @param {Cipher} cipher The cipher to create a helper for.
     *
     * @return {Object} An object with encrypt and decrypt shortcut functions.
     *
     * @static
     *
     * @example
     *
     *     const AES = CryptoJS.lib.Cipher._createHelper(CryptoJS.algo.AES);
     */
    static _createHelper(SubCipher: Function): CipherObj;
    /**
     * Initializes a newly created cipher.
     *
     * @param {number} xformMode Either the encryption or decryption transormation mode constant.
     * @param {WordArray} key The key.
     * @param {Object} cfg (Optional) The configuration options to use for this operation.
     *
     * @example
     *
     *     const cipher = CryptoJS.algo.AES.create(
     *       CryptoJS.algo.AES._ENC_XFORM_MODE, keyWordArray, { iv: ivWordArray }
     *     );
     */
    static create(xformMode: number, key: WordArray, cfg?: CipherCfg): Cipher;
    constructor(xformMode: number, key: WordArray, cfg?: CipherCfg);
    /**
     * Configuration options.
     *
     * @property {WordArray} iv The IV to use for this operation.
     */
    cfg: Base & CipherCfg;
    _xformMode: number;
    _key: WordArray;
    /**
     * Adds data to be encrypted or decrypted.
     *
     * @param {WordArray|string} dataUpdate The data to encrypt or decrypt.
     *
     * @return {WordArray} The data after processing.
     *
     * @example
     *
     *     const encrypted = cipher.process('data');
     *     const encrypted = cipher.process(wordArray);
     */
    process(dataUpdate: WordArray | string): WordArray;
    /**
     * Finalizes the encryption or decryption process.
     * Note that the finalize operation is effectively a destructive, read-once operation.
     *
     * @param {WordArray|string} dataUpdate The final data to encrypt or decrypt.
     *
     * @return {WordArray} The data after final processing.
     *
     * @example
     *
     *     const encrypted = cipher.finalize();
     *     const encrypted = cipher.finalize('data');
     *     const encrypted = cipher.finalize(wordArray);
     */
    finalize(dataUpdate?: WordArray | string): WordArray;
}
/**
 * Abstract base stream cipher template.
 *
 * @property {number} blockSize
 *
 *     The number of 32-bit words this cipher operates on. Default: 1 (32 bits)
 */
export class StreamCipher extends Cipher {
    static create(...args: Array<any>): StreamCipher;
    constructor(...args: Array<any>);
    _doFinalize(): WordArray;
}
/**
 * Abstract base block cipher mode template.
 */
export class BlockCipherMode extends Base {
    static Encryptor: BlockCipherMode;
    static Decryptor: BlockCipherMode;
    /**
     * Creates this mode for encryption.
     *
     * @param {Cipher} cipher A block cipher instance.
     * @param {Array} iv The IV words.
     *
     * @static
     *
     * @example
     *
     *     const mode = CryptoJS.mode.CBC.createEncryptor(cipher, iv.words);
     */
    static createEncryptor(cipher: Cipher, iv: number[]): BlockCipherMode;
    /**
     * Creates this mode for decryption.
     *
     * @param {Cipher} cipher A block cipher instance.
     * @param {Array} iv The IV words.
     *
     * @static
     *
     * @example
     *
     *     const mode = CryptoJS.mode.CBC.createDecryptor(cipher, iv.words);
     */
    static createDecryptor(cipher: Cipher, iv: number[]): BlockCipherMode;
    /**
     * Initializes a newly created mode.
     *
     * @param {Cipher} cipher A block cipher instance.
     * @param {Array} iv The IV words.
     *
     * @example
     *
     *     const mode = CryptoJS.mode.CBC.Encryptor.create(cipher, iv.words);
     */
    static create(cipher: Cipher, iv: Array<number>): BlockCipherMode;
    constructor(cipher: Cipher, iv: Array<number>);
    _cipher: Cipher;
    _iv: number[];
    /**
     * Processes the data block at offset.
     *
     * @param {Array} words The data words to operate on.
     * @param {number} offset The offset where the block starts.
     *
     * @example
     *
     *     mode.processBlock(data.words, offset);
     */
    processBlock(words: number[], offset: number): void;
}
/**
 * Cipher Block Chaining mode.
 */
/**
 * Abstract base CBC mode.
 */
export class CBC extends BlockCipherMode {
}
export interface Padding {
    pad(data: WordArray, blockSize: number): void;
    unpad(data: WordArray): void;
}
/**
 * PKCS #5/7 padding strategy.
 */
export const Pkcs7: Padding;
/**
 * Abstract base block cipher template.
 *
 * @property {number} blockSize
 *
 *    The number of 32-bit words this cipher operates on. Default: 4 (128 bits)
 */
export class BlockCipher extends Cipher {
    static create(xformMode: number, key: WordArray, cfg?: CipherCfg): BlockCipher;    
    constructor(xformMode: number, key: WordArray, cfg?: CipherCfg);
    _mode: BlockCipherMode;
    _doProcessBlock(words: number[], offset: number): void;
    _doFinalize(): WordArray;
    encryptBlock(M: number[], offset: number): void;
    decryptBlock(M: number[], offset: number): void;
}
export interface CipherParamsCfg {
    ciphertext?: WordArray;
    key?: WordArray;
    iv?: WordArray;
    salt?: WordArray;
    algorithm?: Function;
    mode?: Function;
    padding?: Padding;
    blockSize?: number;
    formatter?: Format;
}
/**
 * A collection of cipher parameters.
 *
 * @property {WordArray} ciphertext The raw ciphertext.
 * @property {WordArray} key The key to this ciphertext.
 * @property {WordArray} iv The IV used in the ciphering operation.
 * @property {WordArray} salt The salt used with a key derivation function.
 * @property {Cipher} algorithm The cipher algorithm.
 * @property {Mode} mode The block mode used in the ciphering operation.
 * @property {Padding} padding The padding scheme used in the ciphering operation.
 * @property {number} blockSize The block size of the cipher.
 * @property {Format} formatter
 *    The default formatting strategy to convert this cipher params object to a string.
 */
export class CipherParams extends Base {
    ciphertext?: WordArray;
    key?: WordArray;
    iv?: WordArray;
    salt?: WordArray;
    algorithm?: Function;
    mode?: Function;
    padding?: Padding;
    blockSize?: number;
    formatter?: Format;
    /**
     * Initializes a newly created cipher params object.
     *
     * @param {Object} cipherParams An object with any of the possible cipher parameters.
     *
     * @example
     *
     *     var cipherParams = CryptoJS.lib.CipherParams.create({
     *         ciphertext: ciphertextWordArray,
     *         key: keyWordArray,
     *         iv: ivWordArray,
     *         salt: saltWordArray,
     *         algorithm: CryptoJS.algo.AES,
     *         mode: CryptoJS.mode.CBC,
     *         padding: CryptoJS.pad.PKCS7,
     *         blockSize: 4,
     *         formatter: CryptoJS.format.OpenSSL
     *     });
     */
    static create(cipherParams: CipherParams | CipherParamsCfg): CipherParams;
    constructor(cipherParams: CipherParams | CipherParamsCfg);
    /**
     * Converts this cipher params object to a string.
     *
     * @param {Format} formatter (Optional) The formatting strategy to use.
     *
     * @return {string} The stringified cipher params.
     *
     * @throws Error If neither the formatter nor the default formatter is set.
     *
     * @example
     *
     *     var string = cipherParams + '';
     *     var string = cipherParams.toString();
     *     var string = cipherParams.toString(CryptoJS.format.OpenSSL);
     */
    toString(formatter?: Format): string;
}
export interface Format {
    stringify(cipherParams: CipherParams): string;
    parse(str: string): CipherParams;
}
/**
 * OpenSSL formatting strategy.
 */
export const OpenSSLFormatter: Format;
/**
 * A cipher wrapper that returns ciphertext as a serializable cipher params object.
 */
export class SerializableCipher extends Base {
    static cfg: Base & {
        format: Format;
    };
    /**
     * Encrypts a message.
     *
     * @param {Cipher} cipher The cipher algorithm to use.
     * @param {WordArray|string} message The message to encrypt.
     * @param {WordArray} key The key.
     * @param {Object} cfg (Optional) The configuration options to use for this operation.
     *
     * @return {CipherParams} A cipher params object.
     *
     * @static
     *
     * @example
     *
     *     var ciphertextParams = CryptoJS.lib.SerializableCipher
     *       .encrypt(CryptoJS.algo.AES, message, key);
     *     var ciphertextParams = CryptoJS.lib.SerializableCipher
     *       .encrypt(CryptoJS.algo.AES, message, key, { iv: iv });
     *     var ciphertextParams = CryptoJS.lib.SerializableCipher
     *       .encrypt(CryptoJS.algo.AES, message, key, { iv: iv, format: CryptoJS.format.OpenSSL });
     */
    static encrypt(cipher: Function, message: WordArray | string, key: WordArray | string, cfg?: CipherCfg): CipherParams;
    /**
     * Decrypts serialized ciphertext.
     *
     * @param {Cipher} cipher The cipher algorithm to use.
     * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
     * @param {WordArray} key The key.
     * @param {Object} cfg (Optional) The configuration options to use for this operation.
     *
     * @return {WordArray} The plaintext.
     *
     * @static
     *
     * @example
     *
     *     var plaintext = CryptoJS.lib.SerializableCipher
     *       .decrypt(CryptoJS.algo.AES, formattedCiphertext, key,
     *         { iv: iv, format: CryptoJS.format.OpenSSL });
     *     var plaintext = CryptoJS.lib.SerializableCipher
     *       .decrypt(CryptoJS.algo.AES, ciphertextParams, key,
     *         { iv: iv, format: CryptoJS.format.OpenSSL });
     */
    static decrypt(cipher: Function, ciphertext: CipherParams | string, key: WordArray | string, cfg?: CipherCfg): WordArray;
    /**
     * Converts serialized ciphertext to CipherParams,
     * else assumed CipherParams already and returns ciphertext unchanged.
     *
     * @param {CipherParams|string} ciphertext The ciphertext.
     * @param {Formatter} format The formatting strategy to use to parse serialized ciphertext.
     *
     * @return {CipherParams} The unserialized ciphertext.
     *
     * @static
     *
     * @example
     *
     *     var ciphertextParams = CryptoJS.lib.SerializableCipher
     *       ._parse(ciphertextStringOrParams, format);
     */
    static _parse(ciphertext: CipherParams | string, format: Format): CipherParams;
}
export interface Kdf {
    execute(password: string, keySize: number, ivSize: number, salt?: WordArray | string, hasher?: Function): CipherParams;
}
/**
 * OpenSSL key derivation function.
 */
export const OpenSSLKdf: Kdf;
/**
 * A serializable cipher wrapper that derives the key from a password,
 * and returns ciphertext as a serializable cipher params object.
 */
export class PasswordBasedCipher extends SerializableCipher {
    static cfg: Base & {
        format: Format;
        kdf: Kdf;
    };
    /**
     * Encrypts a message using a password.
     *
     * @param {Cipher} cipher The cipher algorithm to use.
     * @param {WordArray|string} message The message to encrypt.
     * @param {string} password The password.
     * @param {Object} cfg (Optional) The configuration options to use for this operation.
     *
     * @return {CipherParams} A cipher params object.
     *
     * @static
     *
     * @example
     *
     *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher
     *       .encrypt(CryptoJS.algo.AES, message, 'password');
     *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher
     *       .encrypt(CryptoJS.algo.AES, message, 'password', { format: CryptoJS.format.OpenSSL });
     */
    static encrypt(cipher: Function, message: WordArray | string, passed: string, cfg?: CipherCfg): CipherParams;
    /**
     * Decrypts serialized ciphertext using a password.
     *
     * @param {Cipher} cipher The cipher algorithm to use.
     * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
     * @param {string} password The password.
     * @param {Object} cfg (Optional) The configuration options to use for this operation.
     *
     * @return {WordArray} The plaintext.
     *
     * @static
     *
     * @example
     *
     *     var plaintext = CryptoJS.lib.PasswordBasedCipher
     *       .decrypt(CryptoJS.algo.AES, formattedCiphertext, 'password',
     *         { format: CryptoJS.format.OpenSSL });
     *     var plaintext = CryptoJS.lib.PasswordBasedCipher
     *       .decrypt(CryptoJS.algo.AES, ciphertextParams, 'password',
     *         { format: CryptoJS.format.OpenSSL });
     */
    static decrypt(cipher: Function, ciphertext: CipherParams | string, password: string, cfg?: CipherCfg): WordArray;
}
import { BufferedBlockAlgorithm } from './core.js';
import { WordArray } from './core.js';
import { Base } from './core.js';
