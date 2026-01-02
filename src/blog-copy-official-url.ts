/**
 * Copy the official URL of the current blog post to the clipboard.
 *
 * Regardless of the domain currently being used, copy the
 * blog.johnkarahalis.com version of the URL to the clipboard.
 */

import * as clipboard from "./utils/clipboard.ts";

import { baseUrls } from "./utils/blog.ts";
import { alertOnError } from "./utils/general.ts";
import { atBaseUrl } from "./utils/navigation.ts";

alertOnError(() => {
  let url: string;

  if (atBaseUrl(baseUrls.writeAs)) {
    url = document.URL.replace(
      baseUrls.writeAs,
      baseUrls.johnKarahalis,
    );
  } else if (atBaseUrl(baseUrls.johnKarahalis)) {
    url = document.URL;
  } else {
    throw new Error(
      `Not at "${baseUrls.writeAs}" or "${baseUrls.johnKarahalis}".`,
    );
  }

  clipboard.write(url);
  alert(`Official URL successfully copied to clipboard. The URL is:\n\n${url}`);
});
