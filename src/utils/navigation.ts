import { removeFromEnd } from "./general.ts";

/**
 * Navigate to the given URL.
 *
 * @param url - The URL to navigate to.
 */
export function navigate(url: string): void {
  window.location.href = url;
}

/**
 * Append a string to the pathname of the given URL without navigating.
 *
 * If the pathname of the provided URL ends with a slash (e.g., "/about/") and
 * `toAdd` _begins_ with a slash (e.g., "/me/contact"), then a second slash will
 * _not_ be added between the pathname of the provided URL and the addition.
 * In other words, following this same example, the resulting pathname would be
 * "/about/me/contact", not "/about//me/contact".
 *
 * @param urlString - A URL which should have its pathname appended to.
 * @param addition - A string to append to the pathname of the provided URL.
 *
 * @returns The provided URL with the provided addition appended to the
 *          pathname.
 */
export function appendToPathname(
  urlString: string,
  addition: string,
): string {
  const url: URL = new URL(urlString);
  url.pathname = url.pathname.replace(/\/?$/, addition);
  return url.href;
}

/**
 * Remove string from end of the pathname of the given URL without navigating.
 *
 * @param urlString - A URL which should have its pathname removed from.
 * @param removal - A string to remove from to the pathname of the provided URL.
 *
 * @returns The provided URL with the provided removal removed from the
 *          pathname.
 */
export function removeFromEndOfPathname(
  urlString: string,
  removal: string,
): string {
  const url: URL = new URL(urlString);
  url.pathname = removeFromEnd(url.pathname, removal);
  return url.href;
}

/**
 * Append a string to the pathname of the given URL and navigate to it.
 *
 * If the pathname of the provided URL ends with a slash (e.g., "/about/") and
 * `toAdd` _begins_ with a slash (e.g., "/me/contact"), then a second slash will
 * _not_ be added between the pathname of the provided URL and the addition.
 * In other words, following this same example, the resulting pathname would be
 * "/about/me/contact", not "/about//me/contact".
 *
 * @param urlString - A URL which should have its pathname appended to such that
 *                    the resulting URL is navigated to.
 * @param addition - A string to append to the pathname of the provided URL
 *                   before navigating to the resulting URL.
 */
export function appendToPathAndNavigate(
  urlString: string,
  addition: string,
): void {
  const url: URL = new URL(urlString);
  url.pathname = appendToPathname(url.href, addition);
  navigate(url.href);
}

/**
 * Remove string from end of the pathname of the given URL and navigate to it.
 *
 * @param urlString - A URL which should have its pathname removed from such
 *                    that the resulting URL is navigated to.
 * @param removal - A string to remove from to the pathname of the provided URL
 *                  before navigating to the resulting URL.
 * @returns The provided URL with the provided removal removed from the
 *          pathname.
 */
export function removeFromEndOfPathAndNavigate(
  urlString: string,
  removal: string,
): void {
  const url: URL = new URL(urlString);
  url.pathname = removeFromEndOfPathname(url.href, removal);
  navigate(url.href);
}

/**
 * Append a string to the pathname of the current URL and navigate to it.
 *
 * If the pathname of the provided URL ends with a slash (e.g., "/about/") and
 * `toAdd` _begins_ with a slash (e.g., "/me/contact"), then a second slash will
 * _not_ be added between the pathname of the provided URL and the addition.
 * In other words, following this same example, the resulting pathname would be
 * "/about/me/contact", not "/about//me/contact".
 *
 * @param addition - A string to append to the pathname of the current URL
 *                   before navigating to the resulting URL.
 */
export function appendToCurrentPathnameAndNavigate(addition: string): void {
  window.location.href = appendToPathname(window.location.href, addition);
}

/**
 * Remove string from end of the pathname of the current URL and navigate to it.
 *
 * @param removal - A string to remove from to the pathname of the current URL
 *                  before navigating to the resulting URL.
 */
export function removeFromCurrentPathnameAndNavigate(removal: string): void {
  window.location.href = removeFromEndOfPathname(
    window.location.href,
    removal,
  );
}

/**
 * Return true if the provided target URL begins with the provided test URL.
 *
 * @example
 * isBaseUrl("https://www.example.com/about/", "https://www.example.com/about/me"); // true
 *
 * @example
 * atBaseUrl("https://www.example.com/contact/, "https://www.example.com/about/me/contact"); // false
 *
 * @param testUrl - The test URL, which should be compared with the target URL
 *                  (`targetUrl`).
 * @param targetUrl - The target URL, which should be compared with the test URL
 *                    (`testUrl`).
 *
 * @returns `true` if the provided target URL begins with the provided test URL,
 *          otherwise `false`.
 */
export function isBaseUrl(testUrl: string, targetUrl: string): boolean {
  return targetUrl.startsWith(testUrl);
}

/**
 * Return true if the currently-loaded URL begins with the provided test URL.
 *
 * @example
 * // The currently-loaded URL is "https://www.example.com/about/me/contact".
 * atBaseUrl("https://www.example.com/about/"); // true
 *
 * @example
 * // The currently-loaded URL is "https://www.example.com/about/me/contact".
 * atBaseUrl("https://www.example.com/contact/"); // false
 *
 * @param testUrl - The test URL, which should be compared with the
 *                  currently-loaded URL.
 *
 * @returns `true` if the currently-loaded URL begins with the provided test
 *          URL, otherwise `false`.
 */
export function atBaseUrl(testUrl: string): boolean {
  return isBaseUrl(testUrl, window.location.href);
}
