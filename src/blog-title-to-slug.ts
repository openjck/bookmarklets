/**
 * WriteFreely automatically generates slugs based on blog post titles, but only
 * if the title existed when the blog post was first published. This bookmarklet
 * helps me change the slug if I change or add a title later.
 */

import * as blog from "./utils/blog";

import { alertOnError } from "./utils/general";

alertOnError(() => {
  const slug = blog.getSlugForTitle();
  navigator.clipboard.writeText(slug);
  alert(`Slug successfully copied to clipboard. The slug is:\n\n${slug}`);
});
