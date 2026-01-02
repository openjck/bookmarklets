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
