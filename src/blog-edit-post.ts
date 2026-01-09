/**
 * Edit the current blog post, regardless of which domain is currently loaded.
 *
 * Precondition: This bookmarklet must be run while on the view page of a single
 * blog post, on either domain.
 */

import { navigateToEditPage } from "./utils/blog.ts";
import { alertOnError } from "./utils/general.ts";

alertOnError(navigateToEditPage);
