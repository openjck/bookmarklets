/**
 * Edit the current blog post, regardless of what domain is currently loaded.
 */

import * as blog from "./utils/blog";

import { at } from "./utils/navigation";

try {
  const pathname = window.location.pathname;

  if (pathname.endsWith("/edit")) {
    throw new Error("You are already on the edit page.");
  }

  if (
    pathname === "/" ||
    pathname.startsWith("/page/") ||
    pathname === "/johnkarahalis/" ||
    pathname.startsWith("/johnkarahalis/page/") ||
    pathname.startsWith("/me/")
  ) {
    throw new Error("This page cannot be edited.");
  }

  if (at(blog.paths.johnKarahalis)) {
    window.location.href =
      document.URL.replace(blog.paths.johnKarahalis, blog.paths.writeAs) +
      "/edit";
  } else if (at(blog.paths.writeAs)) {
    window.location.href += "/edit";
  } else {
    throw new Error(
      `Not at "${blog.paths.writeAs}" or "${blog.paths.johnKarahalis}".`,
    );
  }
} catch (err) {
  alert(err.toString());
}
