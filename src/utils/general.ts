import BookmarkletError from "../errors/BookmarkletError.ts";

/**
 * Run a function, printing to the console and alerting if an error occurs.
 *
 * The error is always printed to the console.
 *
 * If the error is an instance of the `BookmarkletError` class and the
 * `forEndUser` option is `true`, the message of the error is printed in an
 * `alert`. If `forEndUser` is `false` or the error is of any other type, an
 * `alert` is raised notifying the user to read the console.
 *
 * @param fn - The function to run.
 */
export async function alertOnError(
  fn: () => void | Promise<void>,
): Promise<void> {
  try {
    await fn();
  } catch (err: unknown) {
    if (err instanceof BookmarkletError) {
      console.error(err);
      if (err.options.forEndUser === true) {
        alert(err.message);
      }
    } else {
      alert("An error has occurred.\n\nSee the console for more information.");
      console.error(err);
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
