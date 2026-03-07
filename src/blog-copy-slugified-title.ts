/**
 * Convert the title to a slug, then copy that value to the clipboard.
 *
 * Precondition: This bookmarklet must be run while on the view page of a single
 * blog post or the edit page of a single blog post, on either domain.
 */

import { slugifyTitle } from "./utils/blog.ts";
import { alertOnError } from "./utils/general.ts";
import BookmarkletError from "./errors/BookmarkletError.ts";

alertOnError(async (): Promise<void> => {
  const slug: string | null = await slugifyTitle();

  if (slug === null) {
    throw new BookmarkletError(
      "A slug for this title could not be copied to the clipboard.",
    );
  } else {
    await navigator.clipboard.writeText(slug);

    alert(
      "A slug for this title was copied to clipboard. The slug is:\n" +
        "\n" +
        slug,
    );
  }
});
