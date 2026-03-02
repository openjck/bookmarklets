import BookmarkletError from "../errors/BookmarkletError.ts";
import { removeFromEnd } from "./general.ts";
import * as dom from "./dom.ts";
import * as navigation from "./navigation.ts";

type BaseURLs = {
  blogJohnKarahalis: string;
  blogWriteAs: string;
  writeAsEditAnonymousPost: string;
  writeAs: string;
};

/**
 * The URLs of the Write.as pages where one can write a new blog post.
 */
const writeAsCreateUrls = [
  "https://write.as/",
  "https://write.as/#",
];

/**
 * Important base URLs for managing the blog. All other paths start with these.
 */
export const baseUrls: BaseURLs = {
  blogWriteAs: "https://write.as/johnkarahalis/",
  blogJohnKarahalis: "https://blog.johnkarahalis.com/",

  // The URL for editing an anonymous Post, which, in WriteFreely terminology,
  // somewhat confusingly, is a blog post that is accessible only by link and
  // which is not actually associated with any blog.
  writeAsEditAnonymousPost: "https://write.as/edit/",
  writeAs: "https://write.as/",
};

/**
 * All tags used on the blog, with the pound symbol prefix at the start of each.
 *
 * Tags are sorted alphabetically.
 */
export const tagVocabulary: string[] = [
  "#Favorites",
  "#FiveWordMovieReview",
  "#Life",
  "#MyMaxims",
  "#Quotes",
  "#Recipes",
  "#SocialMedia",
  "#SoftwareDevelopment",
  "#Tech",
  "#TechTips",
].sort();

/**
 * Return the HTML element that the user types in to write or edit a blog post.
 *
 * @param [timeout=0] - A time duration in milliseconds, after which the promise
 *                      should reject with an `Error` if the element could not
 *                      be found.
 *
 * @returns A Promise which resolves to the HTML element that the user types in
 *          to write or edit a blog post.
 */
export async function getWritingArea(
  timeout: number = 0,
): Promise<HTMLTextAreaElement> {
  const writingArea: HTMLTextAreaElement = await dom.getElement<
    HTMLTextAreaElement
  >(
    "textarea#writer",
    timeout,
  );

  return writingArea;
}

/**
 * Return `true` if the provided URL is the URL of a new post creation page.
 *
 * @param urlStr - The URL to test.
 *
 * @returns `true` if the provided URL is the URL of a new post creation page,
 *          otherwise `false`.
 */
export function isNewPostCreationPage(urlStr: string) {
  return writeAsCreateUrls.includes(urlStr);
}

/**
 * Return `true` if the provided URL is the URL of a blog post edit page.
 *
 * @param urlStr - The URL to test.
 *
 * @returns `true` if the provided URL is the URL of a blog post edit page,
 *          otherwise `false`.
 */
export function isBlogPostEditPage(urlStr: string): boolean {
  const url: URL = new URL(urlStr);

  return url.href.startsWith(baseUrls.blogWriteAs) &&
    url.pathname.endsWith("/edit");
}

/**
 * Return `true` if the provided URL is the URL of a anonymous post edit page.
 *
 * @param urlStr - The URL to test.
 *
 * @returns `true` if the provided URL is the URL of a anonymous post edit page,
 *          otherwise `false`.
 */
export function isAnonymousPostEditPage(urlStr: string): boolean {
  return urlStr.startsWith(baseUrls.writeAsEditAnonymousPost);
}

/**
 * Return `true` if the provided URL is of a WriteFreely "Edit metadata" page.
 *
 * @param urlStr - The URL to test.
 *
 * @returns `true` if the provided URL is the URL of a WriteFreely "Edit
 *          metadata" page, otherwise `false`.
 */
export function isBlogPostEditMetaPage(urlStr: string): boolean {
  const url: URL = new URL(urlStr);

  return url.href.startsWith(baseUrls.blogWriteAs) &&
    url.pathname.endsWith("/edit/meta");
}

/**
 * Insert all tags used on the blog at the bottom of the writing area.
 *
 * Precondition: This function must be run on the new post creation page, the
 * edit page of a single blog post, or the edit page of a single anonymous post.
 *
 * Tags are added two newlines below the current text in the writing area. Tags
 * are separated by spaces, and each tag begins with the pound sign.
 *
 * For example, this:
 *
 *   Hello, world!
 *
 * Will become this:
 *
 *   Hello, world!
 *
     #Article #Favorites #FiveWordMovieReview...
 */
export async function insertTags(): Promise<void> {
  if (
    !isNewPostCreationPage(window.location.href) &&
    !isBlogPostEditPage(window.location.href) &&
    !isAnonymousPostEditPage(window.location.href)
  ) {
    throw new BookmarkletError(
      "This bookmarklet must be run on the new post creation page, the edit " +
        "page of a single blog post, or the edit page of a single anonymous " +
        "post.",
    );
  }

  // This needs to be done here, not in setRangeText, because if it were done
  // in setRangeText, after the text was inserted, the cursor would move to the
  // the location before any text was inserted, which would be _before_ the
  // linebreaks.
  //
  // It's also worth noting that, in Firefox, for some reason I don't currently
  // understand, if this string were a template literal (`\n\n`), one fewer
  // newline would be inserted. In fact, it seems that all \n characters are
  // collapsed into one when a template literal is used.
  const writingArea: HTMLTextAreaElement = await getWritingArea();

  writingArea.value += "\n\n";

  const insertPosition: number = writingArea.value.length;

  writingArea.setRangeText(
    tagVocabulary.join(" "),
    insertPosition,
    insertPosition,
    "start", // Move the cursor to the beginning of the line with the tags.
  );
}

/**
 * Return the title of the current blog post, or `null` if there is no title.
 *
 * Precondition: This function can be called from either the view page of
 * a single blog post or the edit page of a single blog post, on either domain.
 *
 * @returns A promise which resolves to either the title of the blog post (if
 *          there is a title) or `null` (if there is no title).
 */
export async function getTitle(): Promise<string | null> {
  if (isBlogPostEditPage(window.location.href)) {
    const writingArea: HTMLTextAreaElement = await getWritingArea();
    const writingAreaText = writingArea.value;

    const title = writingAreaText
      .substring(0, writingAreaText.indexOf("\n"))
      .replace(/^\s*#\s*/, "");

    if (title === "") {
      return null;
    }

    return title;
  } else {
    const titleElement: HTMLHeadingElement = await dom.getElement<
      HTMLHeadingElement
    >("#post-body h2#title");

    if (titleElement === null || titleElement.textContent === null) {
      return null;
    }

    return titleElement.textContent;
  }
}

/**
 * Return a slug for the provided string, similar to how WriteFreely would.
 *
 * This function converts a string to a slug, following the same apparent
 * algorithm that WriteFreely itself follows when to converts a title to a slug,
 * or at least an algorithm that is close enough. (I could dig around the
 * WriteFreely source code to find the exact algorithm, and perhaps some day
 * I will. For now, this is close enough for my needs.) WriteFreely converts
 * a title to a slug only when a blog post is first published.
 *
 * Underscores and hyphens are preserved, one or more consecutive slashes is
 * replaced by a single hyphen, one or more consecutive whitespace characters is
 * replaced by a single hyphen, other non-alphanumeric characters are removed,
 * multiple consecutive hyphens are replaced by a single hyphen, one or more
 * consecutive hyphens at the beginning of the string is removed, one or more
 * hyphens at the end of the string are removed, and all remaining characters
 * are made lower-case.
 *
 * @example
 * // Returns the following:
 * // why-a-b-testing-with-test_function-is-a-feel-good-time
 * slugify("Why A/B testing with test_function is a feel-good time!");
 *
 * @param str - The string that should be converted to a slug.
 *
 * @returns The slug representation of the provided string.
 */
export function slugify(str: string): string {
  return str
    .replace(/^#\s*/, "")
    .replace(/(\/|\\)+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/, "")
    .replace(/-+/g, "-")
    .replace(/^-*/, "")
    .replace(/-*$/, "")
    .toLowerCase();
}

/**
 * Return a slug for the current blog post, based on the title, or `null`.
 *
 * Precondition: This function can be called from either the view page of
 * a single blog post or the edit page of a single blog post, on either domain.
 *
 * If a title cannot be found, `null` is returned.
 *
 * @returns A promise which resolves to either a slug for the current blog post,
 *          based on the title, or `null` if a title cannot be found.
 */
export async function slugifyTitle(): Promise<string | null> {
  const title: string | null = await getTitle();

  if (title === null) {
    return null;
  }

  return slugify(title);
}

/**
 * Return `true` if the page at the given URL can be edited with WriteFreely.
 *
 * @param urlStr - The URL of the page that should be tested for editability.
 *
 * @returns `true` if the page at the given URL can be edited on Write.as,
 * otherwise `false`.
 */
export function isEditable(urlStr: string): boolean {
  const url = new URL(urlStr);

  if (
    (
      !navigation.currentUrlStartsWith(baseUrls.writeAs) &&
      !navigation.currentUrlStartsWith(baseUrls.blogJohnKarahalis)
    ) ||
    url.pathname === "/" ||
    url.pathname.startsWith("/page/") ||
    url.pathname === "/johnkarahalis/" ||
    url.pathname.startsWith("/johnkarahalis/page/") ||
    url.pathname.startsWith("/me/") ||
    url.pathname.endsWith("/edit") ||
    url.pathname.endsWith("/edit/meta")
  ) {
    return false;
  }

  return true;
}

/**
 * Navigate to the edit page of the post whose view page is loaded.
 *
 * Precondition: This must be run when the user is on the view page of a single
 * blog post, on either domain.
 */
export function navigateToEditPage(): void {
  if (isBlogPostEditPage(window.location.href)) {
    throw new BookmarkletError("You are already on the edit page.");
  }

  if (!isEditable(window.location.href)) {
    throw new BookmarkletError("This page cannot be edited.");
  }

  // Whether the user is currently on the view page of a blog post on the
  // public-facing domain.
  const atPublicFacingBlogPostUrl: boolean = navigation.currentUrlStartsWith(
    baseUrls.blogJohnKarahalis,
  );

  // Whether the user is currently on the view page of a blog post on the
  // write.as domain.
  const atWriteAsBlogPostUrl: boolean = navigation.currentUrlStartsWith(
    baseUrls.blogWriteAs,
  );

  // Whether the user is on the view page of an anonymous post.
  //
  // An anonymous post is a post which one can only access if they have the URL.
  // That is, it's not linked from anywhere else. It's useful for working on
  // drafts.
  const atAnonymousPostUrl: boolean =
    navigation.currentUrlStartsWith(baseUrls.writeAs) &&
    window.location.pathname.endsWith(".md");

  if (atPublicFacingBlogPostUrl) {
    const writeAsUrl: string = window.location.href.replace(
      baseUrls.blogJohnKarahalis,
      baseUrls.blogWriteAs,
    );
    navigation.appendToPathAndNavigate(writeAsUrl, "/edit");
  } else if (atWriteAsBlogPostUrl) {
    navigation.appendToCurrentPathnameAndNavigate("/edit");
  } else if (atAnonymousPostUrl) {
    const pathnameWithoutExtension: string = removeFromEnd(
      window.location.pathname,
      ".md",
    );

    const filenameWithoutExtension: string = pathnameWithoutExtension.substring(
      1,
    );

    window.location.pathname = `/edit/${filenameWithoutExtension}`;
  } else {
    throw new BookmarkletError(
      `Not at "${baseUrls.blogWriteAs}" or "${baseUrls.blogJohnKarahalis}".`,
    );
  }
}

/**
 * Navigate to the "Edit metadata" page of the blog post whose view is loaded.
 *
 * Precondition: This must be run when the user is on the view page of a single
 * blog post, on either domain.
 */
export function navigateToEditMetaPage(): void {
  if (isBlogPostEditMetaPage(window.location.href)) {
    throw new BookmarkletError('You are already on the "Edit metadata" page.');
  }

  if (!isEditable(window.location.href)) {
    throw new BookmarkletError("This page cannot be edited.");
  }

  if (navigation.currentUrlStartsWith(baseUrls.blogJohnKarahalis)) {
    navigation.appendToPathAndNavigate(
      window.location.href.replace(
        baseUrls.blogJohnKarahalis,
        baseUrls.blogWriteAs,
      ),
      "/edit/meta",
    );
  } else if (navigation.currentUrlStartsWith(baseUrls.blogWriteAs)) {
    navigation.appendToCurrentPathnameAndNavigate("/edit/meta");
  } else {
    throw new BookmarkletError(
      `Not at "${baseUrls.blogWriteAs}" or "${baseUrls.blogJohnKarahalis}".`,
    );
  }
}

/**
 * Get the slug of the currently-loaded blog post.
 *
 * Precondition: This function must be called from the view page of a single
 * blog post, on either domain.
 *
 * @throws {Error} If the slug cannot be found.
 *
 * @returns The slug of the currently-loaded blog post.
 */
export function getSlug(): string {
  const slug = window.location.pathname.split("/").pop();

  if (slug === undefined) {
    throw new BookmarkletError("Cannot find the slug.");
  }

  return slug;
}

/**
 * Navigate to the same page on the opposite domain.
 *
 * My blog is hosted by write.as and made available to readers at both the
 * write.as domain and the blog.johnkarahalis.com domain. I can edit posts when
 * I'm browsing my blog on the write.as domain, but not when I'm browsing my
 * blog on the blog.johnkarahalis.com domain. By contrast, when I'm sharing
 * links with others, I almost always want to share the URL with the
 * blog.johnkarahalis.com domain.
 *
 * This function swaps between them. If I'm viewing a post or at some other page
 * on the write.as domain, it navigates to that same page on the
 * blog.johnkarahalis.com domain, and vice versa.
 */
export function toggleDomain(): void {
  if (navigation.currentUrlStartsWith(baseUrls.blogWriteAs)) {
    // Edit pages cannot be loaded on blog.johnkarahalis.com, so in addition to
    // changing the domain, remove /edit from the URL. That way, if we started
    // on an edit page of write.as, we end up on the corresponding non-edit page
    // of blog.johnkarahalis.com.
    navigation.removeFromEndOfPathAndNavigate(
      window.location.href.replace(
        baseUrls.blogWriteAs,
        baseUrls.blogJohnKarahalis,
      ),
      "/edit",
    );
  } else if (navigation.currentUrlStartsWith(baseUrls.blogJohnKarahalis)) {
    navigation.navigate(
      window.location.href.replace(
        baseUrls.blogJohnKarahalis,
        baseUrls.blogWriteAs,
      ),
    );
  } else {
    throw new BookmarkletError(
      `Not at "${baseUrls.blogWriteAs}" or "${baseUrls.blogJohnKarahalis}".`,
    );
  }
}

/**
 * Get the public-facing version of the given URL, or `null` if there is none.
 *
 * My blog is hosted by write.as and made available to readers at both the
 * write.as domain and the blog.johnkarahalis.com domain. The latter is the
 * "public-facing" URL, since it's the one that I link to and share with others.
 *
 * This function returns the public-facing version of the given URL regardless
 * of the domain of the given URL.
 *
 * If the given URL has a base associated with the blog, but the specific page
 * has no public-facing equivalent, `null` is returned.
 *
 * @param urlStr - The URL whose public-facing version should be returned.
 *
 * @throws {Error} If the given URL does does not have a base URL associated
 *                 with the blog.
 *
 * @returns The public-facing URL of the current page, or `null` if the URL has
 *          a base URL associated with the blog but the specific page has no
 *          public-facing equivalent.
 */
export function getPublicFacingUrl(urlStr: string): string | null {
  const urlHasWriteAsBase: boolean = urlStr.startsWith(baseUrls.blogWriteAs);
  const urlHasJohnKarahalisBase: boolean = urlStr.startsWith(
    baseUrls.blogJohnKarahalis,
  );

  if (!urlHasWriteAsBase && !urlHasJohnKarahalisBase) {
    throw new BookmarkletError(
      `URL must have a base of "${baseUrls.blogWriteAs}" or ` +
        `"${baseUrls.blogJohnKarahalis}".`,
    );
  }

  let publicFacingUrl: string | null;

  if (isBlogPostEditPage(urlStr) || isBlogPostEditMetaPage(urlStr)) {
    publicFacingUrl = null;
  } else if (urlHasWriteAsBase) {
    publicFacingUrl = urlStr.replace(
      baseUrls.blogWriteAs,
      baseUrls.blogJohnKarahalis,
    );
  } else {
    // By process of elimination, considering the `throw` condition earlier in
    // this function and the `else if` condition tested directly above, we now
    // know the URL must have a base of `baseUrls.blogJohnKarahalis`.
    publicFacingUrl = urlStr;
  }

  return publicFacingUrl;
}

/**
 * Return link URLs that appear in the writing area and have the given base.
 *
 * @param baseUrl - The base URL of link URLs from the writing area that should
 *                  be returned.
 *
 * @return an array of link URLs that appear in the writing area and have the
 *         given base.
 */
export async function getWritingAreaLinkUrlsWithBase(
  baseUrl: string,
): Promise<string[]> {
  const writingArea: HTMLTextAreaElement = await getWritingArea();

  // @ts-expect-error: The browser I'm using supports RegExp.escape().
  const baseRegExpLiteral: RegExp = RegExp.escape(baseUrl);
  const regExp: RegExp = new RegExp(
    `\\((?<url>${baseRegExpLiteral}[^\\)]+)`,
    "g",
  );

  const matches = writingArea.value.matchAll(regExp);

  if (matches === null) {
    return [];
  }

  const urls: string[] = Array.from(matches).reduce((acc, match): string[] => {
    const url = match?.groups?.url;
    if (url === undefined) {
      return acc;
    } else {
      return [...acc, url];
    }
  }, [] as string[]);

  return urls;
}
