/**
 * Navigate to the same blog page, but on the opposing domain.
 *
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

import { baseUrls } from "./utils/blog";
import { alertOnError } from "./utils/general";
import { atBaseUrl, navigate } from "./utils/navigation";

alertOnError(() => {
  if (atBaseUrl(baseUrls.writeAs)) {
    // Edit pages cannot be loaded on blog.johnkarahalis.com, so in addition to
    // changing the domain, remove /edit from the URL. That way, if we started
    // on an edit page of write.as, we end up on the corresponding non-edit page
    // of blog.johnkarahalis.com.
    navigate(
      document.URL.replace(
        baseUrls.writeAs,
        baseUrls.johnKarahalis,
      ).replace(/\/edit$/, ""),
    );
  } else if (atBaseUrl(baseUrls.johnKarahalis)) {
    navigate(
      document.URL.replace(baseUrls.johnKarahalis, baseUrls.writeAs),
    );
  } else {
    throw new Error(
      `Not at "${baseUrls.writeAs}" or "${baseUrls.johnKarahalis}".`,
    );
  }
});
