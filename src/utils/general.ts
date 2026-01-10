/**
 * Run a function, printing to console and alerting if an error occurs.
 *
 * If any object is thrown while running the provided function, more information
 * is printed to the console and an `alert` is raised to notify the user of
 * that fact.
 *
 * @param fn - The function to run.
 * @param [customAlertMessage] - A custom message to show in the `alert`,
 *                               overriding the default.
 */
export async function alertOnError(
  fn: () => void | Promise<void>,
  customAlertMessage: string | undefined = undefined,
): Promise<void> {
  try {
    await fn();
  } catch (err: unknown) {
    // Although this could be set as a default parameter value, it would make the
    // lines for the function signature and the JSDoc documentation very long, so
    // it's being done this way to avoid those problems.
    const defaultAlertMessage =
      "An error has occurred.\n\nSee the console for more information.";

    const alertMessage = customAlertMessage || defaultAlertMessage;

    console.error(err);
    alert(alertMessage);
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
