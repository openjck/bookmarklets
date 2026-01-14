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

/**
 * Raise an alert about a bookmarklet needing to be clicked multiple times.
 */
export function alertAboutMultipleSteps(): void {
  alert(
    "This bookmarklet must be clicked multiple times to complete its work " +
      "because JavaScript execution does not persist across page " +
      "navigation.\n" +
      "\n" +
      "If the bookmarklet seems not to be doing anything, try clicking it " +
      "again.",
  );
}

/**
 * Log a message to the console with an indicator that it came from bookmarklet.
 *
 * @param message - The message to log to the console.
 */
export function log(message: string): void {
  console.log(`[Bookmarklet] ${message}`);
}
