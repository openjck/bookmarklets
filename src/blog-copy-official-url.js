/**
 * Copy the blog.johnkarahalis.com version of the current blog URL to the
 * clipboard.
 */

import * as blog from "./utils/blog";
import * as clipboard from "./utils/clipboard";

import { at } from "./utils/navigation";

try {
  let url;
  if (at(blog.paths.writeAs)) {
    url = document.URL.replace(blog.paths.writeAs, blog.paths.johnKarahalis);
  } else if (at(blog.paths.johnKarahalis)) {
    url = document.URL;
  } else {
    throw new Error(
      `Not at "${blog.paths.writeAs}" or "${blog.paths.johnKarahalis}".`,
    );
  }

  clipboard.write(url);
  alert(`Official URL successfully copied to clipboard. The URL is:\n\n${url}`);
} catch (err) {
  alert(err.toString());
}
