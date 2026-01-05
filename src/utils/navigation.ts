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
 * @param pathnameAddition - A string to append to the pathname of the provided
 *                           URL.
 * @returns The provided URL with the provided addition appended to the
 *          pathname.
 */
export function appendToPath(
  urlString: string,
  pathnameAddition: string,
): string {
  const url = new URL(urlString);
  url.pathname = url.pathname.replace(/\/?$/, pathnameAddition);
  return url.href;
}

/**
 * Remove string from end of the pathname of the given URL without navigating.
 *
 * @param urlString - A URL which should have its pathname removed from.
 * @param pathnameAddition - A string to remove from to the pathname of the
 *                           provided URL.
 * @returns The provided URL with the provided removal removed from the
 *          pathname.
 */
export function removeFromEndOfPath(
  urlString: string,
  removal: string,
): string {
  const url = new URL(urlString);
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
 * @param pathnameAddition - A string to append to the pathname of the provided
 *                           URL before navigating to the resulting URL.
 */
export function appendToPathAndNavigate(
  urlString: string,
  addition: string,
): void {
  navigate(appendToPath(urlString, addition));
}

/**
 * Remove string from end of the pathname of the given URL and navigate to it.
 *
 * @param urlString - A URL which should have its pathname removed from such
 *                    that the resulting URL is navigated to.
 * @param pathnameAddition - A string to remove from to the pathname of the
 *                           provided URL before navigating to the resulting
 *                           URL.
 * @returns The provided URL with the provided removal removed from the
 *          pathname.
 */
export function removeFromEndOfPathAndNavigate(
  urlString: string,
  removal: string,
): void {
  navigate(removeFromEndOfPath(urlString, removal));
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
 * @param pathnameAddition - A string to append to the pathname of the current
 *                           URL before navigating to the resulting URL.
 */
export function appendToCurrentPathAndNavigate(toAdd: string): void {
  window.location.pathname = appendToPath(window.location.pathname, toAdd);
}

/**
 * Remove string from end of the pathname of the current URL and navigate to it.
 *
 * @param pathnameAddition - A string to remove from to the pathname of the
 *                           current URL before navigating to the resulting URL.
 */
export function removeFromCurrentPathAndNavigate(toRemove: string): void {
  window.location.pathname = removeFromEndOfPath(
    window.location.pathname,
    toRemove,
  );
}

/**
 * Return `true` if the current URL begins with the provided string.
 *
 * @example
 * // window.location.href is "https://www.example.com/about/me/contact".
 * atBaseUrl("https://www.example.com/about/"); // true
 *
 * @example
 * // window.location.href is "https://www.example.com/about/me/contact".
 * atBaseUrl("https://www.example.com/contact/"); // false
 *
 * @returns `true` if the current URL begins with the provided string.
 */
export function atBaseUrl(url: string): boolean {
  return window.location.href.startsWith(url);
}
