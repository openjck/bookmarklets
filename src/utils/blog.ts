import * as dom from "./dom.ts";
import * as navigation from "./navigation.ts";

export const baseUrls: Record<string, string> = {
  writeAs: "https://write.as/johnkarahalis/",
  johnKarahalis: "https://blog.johnkarahalis.com/",
};

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

export function getWritingArea(): HTMLTextAreaElement {
  const writingArea: HTMLTextAreaElement = dom.getElement<HTMLTextAreaElement>(
    "textarea#writer",
  );

  return writingArea;
}

/**
 * Return true if the user is currently on the edit page of a blog post.
 *
 * @return `true` if the user is currently on the edit page of a blog post.
 */
export function onEditPage(): boolean {
  return window.location.href.startsWith(baseUrls.writeAs) &&
    window.location.pathname.endsWith("/edit");
}

/**
 * Return true if the user is currently on the "Edit metadata" page of a post.
 */
export function onEditMetaPage(): boolean {
  const pathname: string = window.location.pathname;
  return pathname.startsWith(baseUrls.writeAs) &&
    pathname.endsWith("/edit/meta");
}

export function insertTags(): void {
  // This needs to be done here, not in setRangeText, because if it were done
  // in setRangeText, after the text was inserted, the cursor would move to the
  // the location before any text was inserted, which would be _before_ the
  // linebreaks.
  //
  // It's also worth noting that, in Firefox, for some reason I don't currently
  // understand, if this string were a template literal (`\n\n`), one fewer
  // newline would be inserted. In fact, it seems that all \n characters are
  // collapsed into one when a template literal is used.
  const writingArea: HTMLTextAreaElement = getWritingArea();

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
 * Return the title of the currently-loaded blog post.
 *
 * This function can be run on the view page or the edit page of a single blog
 * post on either domain.
 */
export function getTitle(): string {
  if (onEditPage()) {
    const writingArea: HTMLTextAreaElement = getWritingArea();
    const writingAreaText = writingArea.value;

    return writingAreaText
      .substring(0, writingAreaText.indexOf("\n"))
      .replace(/^\s*#\s*/, "");
  } else {
    const title: dom.NonNullElementProperty<"textContent"> = dom
      .getNonNullElementProperty<HTMLTitleElement, "textContent">(
        "#post-body h2#title",
        "textContent",
      );

    return title;
  }
}

/**
 * Convert the title to a slug. The leading pound sign and whitespace are
 * removed. After that, we follow that same apparent algorithm that WriteFreely
 * uses, where underscores and hyphens are preserved, all whitespace is replaced
 * with hyphens, other non-alphanumeric characters are removed, and all
 * remaining characters are made lower-case.
 */
export function getSlugForTitle(): string {
  const title: string = getTitle();

  return title
    .replace(/^#\s*/, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .toLowerCase();
}

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
    throw new Error("You are already on the edit page.");
  }

  if (!pageIsEditable(window.location.href)) {
    throw new Error("This page cannot be edited.");
  }

  if (navigation.atBaseUrl(baseUrls.johnKarahalis)) {
    navigation.appendToPathAndNavigate(
      window.location.href.replace(baseUrls.johnKarahalis, baseUrls.writeAs),
      "/edit",
    );
  } else if (navigation.atBaseUrl(baseUrls.writeAs)) {
    navigation.appendToCurrentPathAndNavigate("/edit");
  } else {
    throw new Error(
      `Not at "${baseUrls.writeAs}" or "${baseUrls.johnKarahalis}".`,
    );
  }
}

export function navigateToEditMetaPage(): void {
  if (onEditMetaPage()) {
    throw new Error('You are already on the "Edit metadata" page.');
  }

  if (!pageIsEditable(window.location.href)) {
    throw new Error("This page cannot be edited.");
  }

  if (navigation.atBaseUrl(baseUrls.johnKarahalis)) {
    navigation.appendToPathAndNavigate(
      window.location.href.replace(baseUrls.johnKarahalis, baseUrls.writeAs),
      "/edit/meta",
    );
  } else if (navigation.atBaseUrl(baseUrls.writeAs)) {
    navigation.appendToCurrentPathAndNavigate("/edit/meta");
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
