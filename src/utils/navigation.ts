export function at(url) {
  return document.URL.includes(url);
}

export function navigate(url) {
  // deno-lint-ignore no-window
  window.location.href = url;
}
