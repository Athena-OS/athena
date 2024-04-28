
/**
 * RC4 stream cipher algorithm.
 */
export class RC4Algo extends StreamCipher {
}
/**
 * Shortcut functions to the cipher's object interface.
 *
 * @example
 *
 *     var ciphertext = CryptoJS.RC4.encrypt(message, key, cfg);
 *     var plaintext  = CryptoJS.RC4.decrypt(ciphertext, key, cfg);
 */
export const RC4: CipherObj;
/**
 * Modified RC4 stream cipher algorithm.
 */
export class RC4DropAlgo extends StreamCipher {
}
/**
 * Shortcut functions to the cipher's object interface.
 *
 * @example
 *
 *     var ciphertext = CryptoJS.RC4Drop.encrypt(message, key, cfg);
 *     var plaintext  = CryptoJS.RC4Drop.decrypt(ciphertext, key, cfg);
 */
export const RC4Drop: CipherObj;
import { CipherObj } from './cipher-core.js';
import { StreamCipher } from './cipher-core.js';
