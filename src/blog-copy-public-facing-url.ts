/**
 * Copy the public-facing URL of the current page to the clipboard.
 */

import { getPublicFacingUrl } from "./utils/blog.ts";
import { alertOnError } from "./utils/general.ts";

alertOnError(async (): Promise<void> => {
  const publicFacingUrl: string | null = getPublicFacingUrl(
    window.location.href,
  );

  if (publicFacingUrl === null) {
    alert("This page has no corresponding public-facing URL.");
  } else {
    await navigator.clipboard.writeText(publicFacingUrl);

    alert(
      "The public-facing URL was copied to clipboard. The URL is:\n" +
        "\n" +
        publicFacingUrl,
    );
  }
});
