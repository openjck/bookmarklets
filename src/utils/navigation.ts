import { removeFromEnd } from "./general.ts";

export function navigate(url: string): void {
  window.location.href = url;
}

// Importante note: _DO_ provide an initial slash (e.g., /a/b/c) when using this.
export function appendToPathAndNavigate(path: string): void {
  const newPath = window.location.pathname.replace(/\/?$/, path);
  window.location.pathname = newPath;
}

export function removeFromPathAndNavigate(path: string): void {
  window.location.pathname = removeFromEnd(window.location.pathname, path);
}

export function atBaseUrl(url: string): boolean {
  return document.URL.startsWith(url);
}
