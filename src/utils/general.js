export function alertOnError(fn) {
  try {
    fn();
  } catch (err) {
    alert(err.toString());
  }
}
