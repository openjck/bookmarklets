/**
 * Copy the blog.johnkarahalis.com version of the current blog URL to the
 * clipboard.
 */

import * as blog from "./utils/blog";
import * as clipboard from "./utils/clipboard";

import { alertOnError } from "./utils/general";
import { atBaseUrl } from "./utils/navigation";

alertOnError(() => {
  let url;
  if (atBaseUrl(blog.baseUrls.writeAs)) {
    url = document.URL.replace(
      blog.baseUrls.writeAs,
      blog.baseUrls.johnKarahalis,
    );
  } else if (atBaseUrl(blog.baseUrls.johnKarahalis)) {
    url = document.URL;
  } else {
    throw new Error(
      `Not at "${blog.baseUrls.writeAs}" or "${blog.baseUrls.johnKarahalis}".`,
    );
  }

  clipboard.write(url);
  alert(`Official URL successfully copied to clipboard. The URL is:\n\n${url}`);
});
