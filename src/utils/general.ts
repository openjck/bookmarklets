export function alertOnError(fn: () => void) {
  try {
    fn();
  } catch (err) {
    alert(err.toString());
  }
}
