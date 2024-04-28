/**
 * AES block cipher algorithm.
 */
export class AESAlgo extends BlockCipher {
}
/**
 * Shortcut functions to the cipher's object interface.
 *
 * @example
 *
 *     var ciphertext = CryptoJS.AES.encrypt(message, key, cfg);
 *     var plaintext  = CryptoJS.AES.decrypt(ciphertext, key, cfg);
 */
export const AES: CipherObj;
import { CipherObj } from './cipher-core.js';
import { BlockCipher } from './cipher-core.js';
