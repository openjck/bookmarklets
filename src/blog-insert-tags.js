/**
 * Add all possible tags to the bottom of the blog post.
 */

import * as text from "./utils/text";

try {
  text.insertTags();
} catch (err) {
  alert(err.toString());
}
