/**
 * Copy the official URL of the current blog post to the clipboard.
 *
 * Regardless of the domain currently being used, copy the
 * blog.johnkarahalis.com version of the URL to the clipboard.
 */

import { getOfficialUrl } from "./utils/blog.ts";
import { alertOnError } from "./utils/general.ts";

alertOnError(async () => {
  const officialUrl: string = getOfficialUrl();
  await navigator.clipboard.writeText(officialUrl);
  alert(
    "Official URL successfully copied to clipboard. The URL is:\n" +
      "\n" +
      officialUrl,
  );
});
