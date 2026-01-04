/**
 * Run a function and `alert` an error message if any error occurs.
 *
 * If any error is thrown while running the provided function, the `toString()`
 * method of the error is called and an `alert` is raised with that text.
 *
 * If something that is thrown that is not an `Error` object, the item is
 * printed to the console and an `alert` is raised stating that an unknown error
 * occurred and that more information was printed to the console.
 */
export function alertOnError(fn: () => void): void {
  try {
    fn();
  } catch (err: unknown) {
    if (err instanceof Error) {
      alert(err.toString());
    } else {
      console.error("Unknown error:", err);
      alert(
        "An error of an unknown type occurred. " +
          "More information has been printed to the console.",
      );
    }
  }
}

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
