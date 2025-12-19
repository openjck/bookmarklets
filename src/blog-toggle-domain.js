/**
 * My blog is hosted by write.as and made available to readers at both the
 * write.as domain and the blog.johnkarahalis.com domain. I can edit posts when
 * I'm browsing my blog on the write.as domain, but not when I'm browsing my
 * blog on the blog.johnkarahalis.com domain. By contrast, when I'm sharing
 * links with others, I almost always want to share the URL with the
 * blog.johnkarahalis.com domain.
 *
 * This bookmark swaps between them. If I'm viewing a post or other page on the
 * write.as domain, it navigates to that page on the blog.johnkarahalis.com
 * domain, and vice versa.
 */

import * as blog from "./utils/blog";

import { at, navigate } from "./utils/navigation";

try {
  if (at(blog.paths.writeAs)) {
    // Edit pages cannot be loaded on blog.johnkarahalis.com, so in addition to
    // changing the domain, remove /edit from the URL. That way, if we started
    // out on an edit page of Write.as, we end up on the corresponding non-edit
    // page of blog.johnkarahalis.com.
    navigate(
      document.URL.replace(
        blog.paths.writeAs,
        blog.paths.johnKarahalis,
      ).replace(/\/edit$/, ""),
    );
  } else if (at(blog.paths.johnKarahalis)) {
    navigate(
      document.URL.replace(blog.paths.johnKarahalis, blog.paths.writeAs),
    );
  } else {
    throw new Error(
      `Not at "${blog.paths.writeAs}" or "${blog.paths.johnKarahalis}".`,
    );
  }
} catch (err) {
  alert(err.toString());
}
