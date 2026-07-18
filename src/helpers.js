/**
 * @file
 * Helper functions.
 */

import { isValidType } from "./validate.js";

/**
 * Transforms a string to have the first character lower case.
 *
 * @param  {string} value - The string to transform.
 * @return {string}       - The transformed string.
 */
export function firstCharacterToLowerCase(value) {
  isValidType("string", { value });

  return `${value.charAt(0).toLowerCase()}${value.slice(1)}`;
}

/**
 * Transforms a string to have the first character upper case.
 *
 * @param  {string} value - The string to transform.
 * @return {string}       - The transformed string.
 */
export function firstCharacterToUpperCase(value) {
  isValidType("string", { value });

  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
