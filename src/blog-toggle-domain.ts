/**
 * Navigate to the same page on the opposite domain.
 */

import { toggleDomain } from "./utils/blog.ts";
import { alertOnError } from "./utils/general.ts";

alertOnError(toggleDomain);
