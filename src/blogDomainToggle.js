/**
 * My blog is hosted by write.as and made available to readers at both the
 * write.as domain and the blog.johnkarahalis.com domain. I can edit posts when
 * I'm browsing my blog on the write.as domain, but not when I'm browsing my
 * blog on the blog.johnkarahalis.com domain. By contrast, when I'm sharing
 * links with others, I almost always want to share the URL with the
 * blog.johnkarahalis.com domain.
 *
 * This bookmark swaps between them. If I'm viewing a post or other page on the
 * write.as domain, it navigates to that page on the blog.johnkarahalis.com
 * domain, and vice versa.
 */

try {
  function at(url) {
    return document.URL.includes(url);
  }

  function navigate({ from, to }) {
    window.location.href = document.URL.replace(from, to);
  }

  const paths = {
    writeAs: "https://write.as/johnkarahalis/",
    johnKarahalis: "https://blog.johnkarahalis.com/",
  };

  if (at(paths.writeAs)) {
    navigate({ from: paths.writeAs, to: paths.johnKarahalis });
  } else if (at(paths.johnKarahalis)) {
    navigate({ from: paths.johnKarahalis, to: paths.writeAs });
  } else {
    throw new Error(`Not at "${paths.writeAs}" or "${paths.johnKarahalis}".`);
  }
} catch (err) {
  alert(err.toString());
}
