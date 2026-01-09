/**
 * Copy the official URL of the current blog post to the clipboard.
 */

import { getOfficialUrl } from "./utils/blog.ts";
import { alertOnError } from "./utils/general.ts";

alertOnError(async () => {
  const officialUrl: string = getOfficialUrl();

  await navigator.clipboard.writeText(officialUrl);

  alert(
    "The official URL was successfully copied to clipboard. The URL is:\n" +
      "\n" +
      officialUrl,
  );
});
