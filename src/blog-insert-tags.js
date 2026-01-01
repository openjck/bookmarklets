/**
 * Add all possible tags to the bottom of the blog post.
 */

import * as blog from "./utils/blog";

try {
  blog.insertTags();
} catch (err) {
  alert(err.toString());
}
