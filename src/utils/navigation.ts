import { removeFromEnd } from "./general.ts";

type CompleteURLString = string;

/**
 * Navigate to the given URL.
 *
 * @param url - The URL to navigate to.
 */
export function navigate(url: CompleteURLString): void {
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
  urlString: CompleteURLString,
  addition: string,
): CompleteURLString {
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
  urlString: CompleteURLString,
  removal: string,
): CompleteURLString {
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
  urlString: CompleteURLString,
  addition: string,
): void {
  const url: URL = new URL(urlString);
  const newUrl: CompleteURLString = appendToPathname(url.href, addition);
  navigate(newUrl);
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
  urlString: CompleteURLString,
  removal: string,
): void {
  const url: URL = new URL(urlString);
  const newUrl: CompleteURLString = removeFromEndOfPathname(url.href, removal);
  navigate(newUrl);
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
 * Return true if the currently-loaded URL starts with the provided test URL.
 *
 * @example
 * // The currently-loaded URL is "https://www.example.com/about/me/contact".
 * currentUrlStartsWith("https://www.example.com/about/"); // true
 *
 * @example
 * // The currently-loaded URL is "https://www.example.com/about/me/contact".
 * currentUrlStartsWith("https://www.example.com/contact/"); // false
 *
 * @param testUrl - The test URL, which should be compared with the
 *                  currently-loaded URL.
 *
 * @returns `true` if the currently-loaded URL starts with the provided test
 *          URL, otherwise `false`.
 */
export function currentUrlStartsWith(testUrl: string): boolean {
  return window.location.href.startsWith(testUrl);
}

/**
 * Return `true` if the given URL responds with an HTTP code below 400.
 *
 * @param urlStr - The URL to test.
 *
 * @return `true` if the given URL responds with an HTTP code below 400,
 *         otherwise `false`.
 */
export async function isReachable(urlStr: string): Promise<boolean> {
  try {
    const response = await fetch(urlStr);

    if (response.status < 400) {
      return true;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}
