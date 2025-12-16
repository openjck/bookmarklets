/**
 * Convert selected text to a slug. The leading pound sign and whitespace are
 * removed, so that this bookmarklet works when the _entire_ Markdown title is
 * selected, including those characters. After that, we follow that same
 * apparent algorithm that WriteFreely uses, where underscores and hyphens are
 * preserved, other non-alphanumeric characters are removed, all whitespace
 * is replaced with hyphens, and all remaining characters are made lower-case.
 * The slug is automatically copied to the clipboard.
 *
 * WriteFreely automatically generates slugs based on blog post titles, but only
 * if the title existed when the blog post was first published. This bookmarklet
 * helps me change the slug if I change or add a title later.
 */

try {
  const selectedText = window.getSelection().toString();

  if (selectedText.length === 0) {
    alert("Error: No text is selected.");
  }

  const slug = selectedText
    .replace(/^#\s*/, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .toLowerCase();

  navigator.clipboard.writeText(slug);

  alert(`Slug successfully copied to clipboard. The slug is:\n\n${slug}`);
} catch (err) {
  alert(err.toString());
}
