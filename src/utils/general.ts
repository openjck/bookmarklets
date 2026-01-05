/**
 * Remove a substring from the end of another string, or return the original.
 *
 * If the provided substring does not appear at the end of the source string,
 * return the source string unaltered.
 *
 * @param sourceString - The string that should have a substring removed from
 *                       the end of it.
 * @param substring - The substring to remove the end of the source string.
 *
 * @returns The source string with the provided substring removed, if it occurs
 *          at the end of the source string, otherwise the source string
 *          unaltered.
 */
export function removeFromEnd(str: string, removal: string): string {
  const lastIndex = str.lastIndexOf(removal);

  if (lastIndex === -1) {
    return str;
  }

  return str.substring(0, lastIndex);
}
