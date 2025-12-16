/**
 * Edit the current blog post, regardless of what domain is currently loaded.
 */

try {
  const pathname = window.location.pathname;

  function at(url) {
    return document.URL.includes(url);
  }

  const paths = {
    writeAs: "https://write.as/johnkarahalis/",
    johnKarahalis: "https://blog.johnkarahalis.com/",
  };

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

  if (at(paths.johnKarahalis)) {
    window.location.href =
      document.URL.replace(paths.johnKarahalis, paths.writeAs) + "/edit";
  } else if (at(paths.writeAs)) {
    window.location.href += "/edit";
  } else {
    throw new Error(`Not at "${paths.writeAs}" or "${paths.johnKarahalis}".`);
  }
} catch (err) {
  alert(err.toString());
}
