export function atBaseUrl(url: string): boolean {
  return document.URL.startsWith(url);
}

export function navigate(url: string): void {
  // deno-lint-ignore no-window
  window.location.href = url;
}
