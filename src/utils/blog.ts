import { atBaseUrl } from "./navigation";

export const baseUrls = {
  writeAs: "https://write.as/johnkarahalis/",
  johnKarahalis: "https://blog.johnkarahalis.com/",
};

export const tagVocabulary = [
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
  const writingArea: HTMLTextAreaElement | null = document.querySelector(
    "textarea#writer",
  );

  if (writingArea === null) {
    throw new Error("Cannot get writing area element.");
  }

  return writingArea;
}

/**
 * Return true if the user is currently on the edit page of a blog post.
 */
export function onEditPage() {
  // deno-lint-ignore no-window
  return window.location.pathname.endsWith("/edit");
}

export function insertTags() {
  // This needs to be done here, not in setRangeText, because if it were done
  // in setRangeText, after the text was inserted, the cursor would move to the
  // the location before any text was inserted, which would be _before_ the
  // linebreaks.
  //
  // It's also worth noting that, in Firefox, for some reason I don't currently
  // understand, if this string were a template literal (`\n\n`), one fewer
  // newline would be inserted. In fact, it seems that all \n characters are
  // collapsed into one when a template literal is used.
  writingArea.value += "\n\n";

  const insertPosition = writingArea.value.length;

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
    const writingAreaText = writingArea.value;
    return writingAreaText
      .substring(0, writingAreaText.indexOf("\n"))
      .replace(/^\s*#\s*/, "");
  } else {
    return document.querySelector("#post-body #title").textContent;
  }
}

/**
 * Convert the title to a slug. The leading pound sign and whitespace are
 * removed. After that, we follow that same apparent algorithm that WriteFreely
 * uses, where underscores and hyphens are preserved, all whitespace is replaced
 * with hyphens, other non-alphanumeric characters are removed, and all
 * remaining characters are made lower-case.
 */
export function getSlugForTitle() {
  const title = getTitle();

  return title
    .replace(/^#\s*/, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .toLowerCase();
}

export function navigateToEditPage() {
  // deno-lint-ignore no-window
  const pathname = window.location.pathname;

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

  if (atBaseUrl(blog.paths.johnKarahalis)) {
    navigate(
      document.URL.replace(blog.paths.johnKarahalis, blog.paths.writeAs) +
        "/edit",
    );
  } else if (atBaseUrl(blog.paths.writeAs)) {
    navigate(`${document.URL}/edit`);
  } else {
    throw new Error(
      `Not at "${blog.paths.writeAs}" or "${blog.paths.johnKarahalis}".`,
    );
  }
}
