/**
 * Edit the current blog post, regardless of what domain is currently loaded.
 */

import { navigateToEditPage } from "./utils/blog";
import { alertOnError } from "./utils/general";

alertOnError(() => {
  navigateToEditPage();
});
