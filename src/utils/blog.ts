import * as dom from "./dom.ts";
import * as navigation from "./navigation.ts";

/**
 * Important base URLs for managing the blog. All other paths start with these.
 */
export const baseUrls: Record<string, string> = {
  writeAs: "https://write.as/johnkarahalis/",
  johnKarahalis: "https://blog.johnkarahalis.com/",
};

/**
 * All tags used on the blog, with the pound symbol prefix at the start of each.
 */
export const tagVocabulary: string[] = [
  "#Article",
  "#Favorites",
  "#FiveWordMovieReview",
  "#Life",
  "#Miscellaneous",
  "#PublicNotice",
  "#Quotes",
  "#Recipes",
  "#SocialMedia",
  "#SoftwareDevelopment",
  "#Tech",
  "#TechTips",
];

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
 * Return `true` if the user is currently on the edit page of a blog post.
 *
 * @return `true` if the user is currently on the edit page of a blog post.
 */
export function onEditPage(): boolean {
  return window.location.href.startsWith(baseUrls.writeAs) &&
    window.location.pathname.endsWith("/edit");
}

/**
 * Return `true` if the user is on the "Edit metadata" page of a blog post.
 *
 * @return `true` if the user is on the "Edit metadata" page of a blog post.
 */
export function onEditMetaPage(): boolean {
  const pathname: string = window.location.pathname;
  return pathname.startsWith(baseUrls.writeAs) &&
    pathname.endsWith("/edit/meta");
}

/**
 * Insert all tags used on the blog at the bottom of the writing area.
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
 * This function can be called from either the view page of a single blog post
 * or the edit page of a single blog post.
 *
 * @return A promise which resolves to either the title of the blog post (if
 *         there is a title) or `null` (if there is no title).
 */
export async function getTitle(): Promise<string | null> {
  if (onEditPage()) {
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
 * Return a slug for the current blog post, based on the title, or `null`.
 *
 * This algorithm follows the same apparent algorithm that Write.as itself seems
 * to follow when it converts a title to a slug, which it does only when the
 * blog post is first published: underscores and hyphens are preserved, all
 * whitespace is replaced with hyphens, other non-alphanumeric characters are
 * removed, and all remaining characters are made lower-case.
 *
 * If a title cannot be found, `null` is returned.
 *
 * This function can be called from either the view page of a single blog post
 * or the edit page of a single blog post.
 *
 * @return A promise which resolves to either a slug for the current blog post,
 *         based on the title, or `null` if a title cannot be found.
 */
export async function getSlugForTitle(): Promise<string | null> {
  const title: string | null = await getTitle();

  if (title === null) {
    return null;
  }

  return title
    .replace(/^#\s*/, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .toLowerCase();
}

// TODO: Next
export function pageIsEditable(urlStr: string): boolean {
  const url = new URL(urlStr);

  if (
    url.pathname === "/" ||
    url.pathname.startsWith("/page/") ||
    url.pathname === "/johnkarahalis/" ||
    url.pathname.startsWith("/johnkarahalis/page/") ||
    url.pathname.startsWith("/me/")
  ) {
    return false;
  }

  return true;
}

export function navigateToEditPage(): void {
  if (onEditPage()) {
    alert("You are already on the edit page.");
    return;
  }

  if (!pageIsEditable(window.location.href)) {
    alert("This page cannot be edited.");
    return;
  }

  if (navigation.atBaseUrl(baseUrls.johnKarahalis)) {
    navigation.appendToPathAndNavigate(
      window.location.href.replace(baseUrls.johnKarahalis, baseUrls.writeAs),
      "/edit",
    );
  } else if (navigation.atBaseUrl(baseUrls.writeAs)) {
    navigation.appendToCurrentPathnameAndNavigate("/edit");
  } else {
    throw new Error(
      `Not at "${baseUrls.writeAs}" or "${baseUrls.johnKarahalis}".`,
    );
  }
}

export function navigateToEditMetaPage(): void {
  if (onEditMetaPage()) {
    alert('You are already on the "Edit metadata" page.');
    return;
  }

  if (!pageIsEditable(window.location.href)) {
    alert("This page cannot be edited.");
    return;
  }

  if (navigation.atBaseUrl(baseUrls.johnKarahalis)) {
    navigation.appendToPathAndNavigate(
      window.location.href.replace(baseUrls.johnKarahalis, baseUrls.writeAs),
      "/edit/meta",
    );
  } else if (navigation.atBaseUrl(baseUrls.writeAs)) {
    navigation.appendToCurrentPathnameAndNavigate("/edit/meta");
  } else {
    throw new Error(
      `Not at "${baseUrls.writeAs}" or "${baseUrls.johnKarahalis}".`,
    );
  }
}

/**
 * Return the slug of the currently loaded blog post.
 *
 * This function must be called from the view page of a single blog post on
 * either domain.
 */
export function getSlug(): string {
  const slug = window.location.pathname.split("/").pop();

  if (slug === undefined) {
    throw new Error("Cannot find the slug.");
  }

  return slug;
}

/**
 * Navigate to the same blog page, but on the opposing domain.
 *
 * My blog is hosted by write.as and made available to readers at both the
 * write.as domain and the blog.johnkarahalis.com domain. I can edit posts when
 * I'm browsing my blog on the write.as domain, but not when I'm browsing my
 * blog on the blog.johnkarahalis.com domain. By contrast, when I'm sharing
 * links with others, I almost always want to share the URL with the
 * blog.johnkarahalis.com domain.
 *
 * This function swaps between them. If I'm viewing a post or other page on the
 * write.as domain, it navigates to that page on the blog.johnkarahalis.com
 * domain, and vice versa.
 */
export function toggleDomain(): void {
  if (navigation.atBaseUrl(baseUrls.writeAs)) {
    // Edit pages cannot be loaded on blog.johnkarahalis.com, so in addition to
    // changing the domain, remove /edit from the URL. That way, if we started
    // on an edit page of write.as, we end up on the corresponding non-edit page
    // of blog.johnkarahalis.com.
    navigation.removeFromEndOfPathAndNavigate(
      window.location.href.replace(baseUrls.writeAs, baseUrls.johnKarahalis),
      "/edit",
    );
  } else if (navigation.atBaseUrl(baseUrls.johnKarahalis)) {
    navigation.navigate(
      window.location.href.replace(baseUrls.johnKarahalis, baseUrls.writeAs),
    );
  } else {
    throw new Error(
      `Not at "${baseUrls.writeAs}" or "${baseUrls.johnKarahalis}".`,
    );
  }
}

export function getOfficialUrl(): string {
  let officialUrl: string;

  if (navigation.atBaseUrl(baseUrls.writeAs)) {
    officialUrl = window.location.href.replace(
      baseUrls.writeAs,
      baseUrls.johnKarahalis,
    );
  } else if (navigation.atBaseUrl(baseUrls.johnKarahalis)) {
    officialUrl = window.location.href;
  } else {
    throw new Error(
      `Not at "${baseUrls.writeAs}" or "${baseUrls.johnKarahalis}".`,
    );
  }

  return officialUrl;
}
