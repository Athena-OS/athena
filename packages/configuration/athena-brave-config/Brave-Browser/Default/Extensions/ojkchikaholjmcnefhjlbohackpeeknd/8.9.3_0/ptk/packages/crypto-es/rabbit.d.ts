/**
 * Rabbit stream cipher algorithm
 */
export class RabbitAlgo extends StreamCipher {
}
/**
 * Shortcut functions to the cipher's object interface.
 *
 * @example
 *
 *     var ciphertext = CryptoJS.Rabbit.encrypt(message, key, cfg);
 *     var plaintext  = CryptoJS.Rabbit.decrypt(ciphertext, key, cfg);
 */
export const Rabbit: CipherObj;
import { CipherObj } from './cipher-core.js';
import { StreamCipher } from './cipher-core.js';
