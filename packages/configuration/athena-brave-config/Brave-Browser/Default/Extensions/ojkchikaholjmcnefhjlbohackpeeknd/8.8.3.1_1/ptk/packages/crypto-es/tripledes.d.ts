/**
 * DES block cipher algorithm.
 */
export class DESAlgo extends BlockCipher {
}
/**
 * Shortcut functions to the cipher's object interface.
 *
 * @example
 *
 *     var ciphertext = CryptoJS.DES.encrypt(message, key, cfg);
 *     var plaintext  = CryptoJS.DES.decrypt(ciphertext, key, cfg);
 */
export const DES: CipherObj;
/**
 * Triple-DES block cipher algorithm.
 */
export class TripleDESAlgo extends BlockCipher {
}
/**
 * Shortcut functions to the cipher's object interface.
 *
 * @example
 *
 *     var ciphertext = CryptoJS.TripleDES.encrypt(message, key, cfg);
 *     var plaintext  = CryptoJS.TripleDES.decrypt(ciphertext, key, cfg);
 */
export const TripleDES: CipherObj;
import { CipherObj } from './cipher-core.js';
import { BlockCipher } from './cipher-core.js';
