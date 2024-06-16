/**
 * Password-Based Key Derivation Function 2 algorithm.
 */
export class PBKDF2Algo extends Base {
    static create(cfg?: KDFCfg): PBKDF2Algo;
    constructor(cfg?: KDFCfg);
    compute(password: WordArray | string, salt: WordArray | string): WordArray;
}
/**
 * Computes the Password-Based Key Derivation Function 2.
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
 *     var key = CryptoJS.PBKDF2(password, salt);
 *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8 });
 *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8, iterations: 1000 });
 */
export const PBKDF2: KDFFn;
import { Base } from './core.js';
import { WordArray } from './core.js';
import { KDFCfg } from './core.js';
import { KDFFn } from './core.js';
