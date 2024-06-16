/**
 * This key derivation function is meant to conform with EVP_BytesToKey.
 * www.openssl.org/docs/crypto/EVP_BytesToKey.html
 */
export class EvpKDFAlgo extends Base {
    static create(cfg?: KDFCfg): EvpKDFAlgo;
    constructor(cfg?: KDFCfg);
    compute(password: WordArray | string, salt: WordArray | string): WordArray;
}
/**
 * Derives a key from a password.
 *
 * @param {WordArray|string} password The password.
 * @param {WordArray|string} salt A salt.
 * @param {Object} cfg (Optional) The configuration options to use for this computation.
 *
 * @return {WordArray} The derived key.
 *
 * @static
 *
 * @example
 *
 *     var key = CryptoJS.EvpKDF(password, salt);
 *     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8 });
 *     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8, iterations: 1000 });
 */
export const EvpKDF: KDFFn;
import { Base } from './core.js';
import { WordArray } from './core.js';
import { KDFCfg } from './core.js';
import { KDFFn } from './core.js';
