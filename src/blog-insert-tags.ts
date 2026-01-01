/**
 * Add all possible tags to the bottom of the blog post.
 */

import * as blog from "./utils/blog";

import { alertOnError } from "./utils/general";

alertOnError(() => {
  blog.insertTags();
});
