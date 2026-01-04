export function alertOnError(fn: () => void): void {
  try {
    fn();
  } catch (err: unknown) {
    if (err instanceof Error) {
      alert(err.toString());
    } else {
      alert(
        "An error of an unknown type occurred. " +
          "It has been printed to the console.",
      );
      console.error(err);
    }
  }
}

// Important note: If the substring is not found, return the original string.
export function removeFromEnd(str: string, toRemove: string): string {
  const lastIndex = str.lastIndexOf(toRemove);

  if (lastIndex === -1) {
    return str;
  }

  return str.substring(0, lastIndex);
}
