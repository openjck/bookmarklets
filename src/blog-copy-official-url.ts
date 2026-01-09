/**
 * Copy the public-facing URL of the current page to the clipboard.
 */

import { getPublicFacingUrl } from "./utils/blog.ts";
import { alertOnError } from "./utils/general.ts";

alertOnError(async () => {
  const publicFacingUrl: string = getPublicFacingUrl();

  await navigator.clipboard.writeText(publicFacingUrl);

  alert(
    "The public-facing URL was copied to clipboard. The URL is:\n" +
      "\n" +
      publicFacingUrl,
  );
});
