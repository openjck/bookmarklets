/**
 * Edit the current blog post, regardless of what domain is currently loaded.
 *
 * This bookmarklet must be run while on the view page of a single blog post, on
 * either domain.
 */

import { navigateToEditPage } from "./utils/blog";
import { alertOnError } from "./utils/general";

alertOnError(navigateToEditPage);
