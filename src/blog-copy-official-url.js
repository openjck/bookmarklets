/**
 * Copy the blog.johnkarahalis.com version of the current blog URL to the
 * clipboard.
 */

try {
  function at(url) {
    return document.URL.includes(url);
  }

  const paths = {
    writeAs: "https://write.as/johnkarahalis/",
    johnKarahalis: "https://blog.johnkarahalis.com/",
  };

  let url;
  if (at(paths.writeAs)) {
    url = document.URL.replace(paths.writeAs, paths.johnKarahalis);
  } else if (at(paths.johnKarahalis)) {
    url = document.URL;
  } else {
    throw new Error(`Not at "${paths.writeAs}" or "${paths.johnKarahalis}".`);
  }

  navigator.clipboard.writeText(url);
  alert(`Official URL successfully copied to clipboard. The URL is:\n\n${url}`);
} catch (err) {
  alert(err.toString());
}
