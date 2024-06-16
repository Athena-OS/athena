/**
 * RIPEMD160 hash algorithm.
 */
export class RIPEMD160Algo extends Hasher {}
/**
 * Shortcut function to the hasher's object interface.
 *
 * @param {WordArray|string} message The message to hash.
 *
 * @return {WordArray} The hash.
 *
 * @static
 *
 * @example
 *
 *     var hash = CryptoJS.RIPEMD160('message');
 *     var hash = CryptoJS.RIPEMD160(wordArray);
 */
export const RIPEMD160: HashFn;
/**
 * Shortcut function to the HMAC's object interface.
 *
 * @param {WordArray|string} message The message to hash.
 * @param {WordArray|string} key The secret key.
 *
 * @return {WordArray} The HMAC.
 *
 * @static
 *
 * @example
 *
 *     var hmac = CryptoJS.HmacRIPEMD160(message, key);
 */
export const HmacRIPEMD160: HMACHashFn;
import { Hasher } from './core.js';
import { HashFn } from './core.js';
import { HMACHashFn } from './core.js';
