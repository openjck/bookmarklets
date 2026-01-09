/**
 * Add all possible tags to the bottom of the writing area of a blog post.
 *
 * Precondition: This bookmarklet must be run while on the edit page of a single
 * blog post.
 */

import { insertTags } from "./utils/blog.ts";
import { alertOnError } from "./utils/general.ts";

alertOnError(insertTags);
