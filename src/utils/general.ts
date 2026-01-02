export function alertOnError(fn: () => void): void {
  try {
    fn();
  } catch (err) {
    alert(err.toString());
  }
}
