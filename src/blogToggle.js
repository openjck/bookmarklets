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

const urls = {
  writeAs: 'write.as/johnkarahalis',
  johnkarahalis: 'blog.johnkarahalis.com',
};

if (document.URL.includes(urls.writeAs)) {
  window.location.href = document.URL.replace(urls.writeAs, urls.johnkarahalis);
} else if (document.URL.includes(urls.johnkarahalis)) {
  window.location.href = document.URL.replace(urls.johnkarahalis, urls.writeAs);
} else {
  alert(
    `There's nothing to do, because you're on neither "${urls.writeAs}" nor ` +
    `"${urls.johnkarahalis}".`
  );
}
