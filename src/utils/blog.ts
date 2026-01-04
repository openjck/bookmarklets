import { getElement, getElementAttribute } from "./dom.ts";
import { atBaseUrl, navigate } from "./navigation.ts";

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
  const writingArea: HTMLTextAreaElement = getElement<HTMLTextAreaElement>(
    "textarea#writer",
  );

  return writingArea;
}

/**
 * Return true if the user is currently on the edit page of a blog post.
 */
export function onEditPage(): boolean {
  const pathname: string = window.location.pathname;
  return pathname.startsWith(baseUrls.writeAs) && pathname.endsWith("/edit");
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
    const title: string = getElementAttribute<HTMLTitleElement>(
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

export function navigateToEditPage(): void {
  const pathname: string = window.location.pathname;

  if (onEditPage()) {
    throw new Error("You are already on the edit page.");
  }

  if (
    pathname === "/" ||
    pathname.startsWith("/page/") ||
    pathname === "/johnkarahalis/" ||
    pathname.startsWith("/johnkarahalis/page/") ||
    pathname.startsWith("/me/")
  ) {
    throw new Error("This page cannot be edited.");
  }

  if (atBaseUrl(baseUrls.johnKarahalis)) {
    navigate(
      document.URL.replace(baseUrls.johnKarahalis, baseUrls.writeAs) +
        "/edit",
    );
  } else if (atBaseUrl(baseUrls.writeAs)) {
    navigate(`${document.URL}/edit`);
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
