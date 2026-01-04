import { removeFromEnd } from "./general.ts";

export function navigate(url: string): void {
  window.location.href = url;
}

// If an initial slash is provided in toAdd (e.g., "/a/b/c"), then, even if the
// pathname currently ends with a slash, a _second_ slash will _not_ be added
// between the current pathname and the addition.
export function appendToPath(urlStr: string, toAdd: string): string {
  const url = new URL(urlStr);
  url.pathname = url.pathname.replace(/\/?$/, toAdd);
  return url.href;
}

export function removeFromEndOfPath(urlStr: string, toRemove: string): string {
  const url = new URL(urlStr);
  url.pathname = removeFromEnd(url.pathname, toRemove);
  return url.href;
}

// If an initial slash is provided in toAdd (e.g., "/a/b/c"), then, even if the
// pathname currently ends with a slash, a _second_ slash will _not_ be added
// between the current pathname and the addition.
export function appendToPathAndNavigate(urlStr: string, toAdd: string): void {
  navigate(appendToPath(urlStr, toAdd));
}

export function removeFromEndOfPathAndNavigate(
  urlStr: string,
  toRemove: string,
): void {
  navigate(removeFromEndOfPath(urlStr, toRemove));
}

// If an initial slash is provided in toAdd (e.g., "/a/b/c"), then, even if the
// pathname currently ends with a slash, a _second_ slash will _not_ be added
// between the current pathname and the addition.
export function appendToCurrentPathAndNavigate(toAdd: string): void {
  appendToPathAndNavigate(document.URL, toAdd);
}

export function removeFromCurrentPathAndNavigate(toRemove: string): void {
  removeFromEndOfPathAndNavigate(document.URL, toRemove);
}

export function atBaseUrl(url: string): boolean {
  return document.URL.startsWith(url);
}
