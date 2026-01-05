/**
 * Copy the official URL of the current blog post to the clipboard.
 */

import { getOfficialUrl } from "./utils/blog.ts";

// At the time of this writing (2026-01-05), top-level await is not supported by
// esbuild when using the "iife" format, as we are in this project, making this
// additional, "inner" IIFE necessary.
(async () => {
  const officialUrl: string = getOfficialUrl();

  await navigator.clipboard.writeText(officialUrl);

  alert(
    "The official URL was successfully copied to clipboard. The URL is:\n" +
      "\n" +
      officialUrl,
  );
})();
