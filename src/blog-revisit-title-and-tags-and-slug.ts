/**
 * Purpose: Revisit and potentially change the title, tags, and slug of a single
 * blog post. I want to do this because I only really got into the habit of
 * using a title halfway through the thoughts migration, and I changed the tags
 * that I use close to the end of the thoughts migration.
 */

import { alertOnError } from "./utils/general";
import * as blog from "./utils/blog";

/**
 * If the user is on the "blog.johnkarahalis.com" view page for a blog post,
 * navigate to the "write.as" view page of the same blog post.
 */
function navigateToPostViewOnWriteAs() {
  if (atBaseUrl(baseUrls.johnKarahalis)) {
    navigate(
      document.URL.replace(baseUrls.johnKarahalis, baseUrls.writeAs),
    );
  }
}

function getNumViewers() {
  const viewSpan = document.querySelector("#post .views");
  return Number(viewSpan.textContent.split(" ")[0]);
}

function showInstructionsEditTitleAndTags() {
  alert(
    "Manual step:\n\n" +
      "Modify the title and tags as desired.\n" +
      "\n" +
      'Type "ALT+C" (think "C" for "Continue") when done.',
  );
}

function onDoneEditingKeystroke(fn) {
  document.addEventListener("keydown", (e) => {
    if (e.altKey === true && e.key.toLowerCase() === "c") {
      e.preventDefault();
      fn();
    }
  });
}

function verifyOneSetOfTags() {
  // TODO: Actually determine this programatically.
  const oneSetOfTags = false;

  if (oneSetOfTags !== true) {
    alert(
      "There should only be one set of tags, but more than one set exists.\n" +
        "\n" +
        'Remove all but one set of tags, then press "ALT+C" to continue.',
    );
    onDoneEditingKeystroke(verifyOneSetOfTags);
  }
}

function publishChangesOrNavigateToView() {
  alert(
    "TODO: Automate.\n\nPublish these changes, or if there are no changes, navigate to the view page for this blog post.",
  );
}

function conditionallyApplyNewSlug(numViewers) {
  alert(
    `TODO: Automate.\n\nGenerate a new slug and apply it if needed. There have been ${numViewers} viewers.`,
  );

  // TODO: **If the new slug would be different**, prompt the user (with
  // window.confirm) to show them how many viewers there have been, what the old
  // slug is, and what the new slug would be, asking whether they want the slug
  // to be changed. On the other hand, if the new slug is the same as the old
  // slug, raise an alert() saying that.
  //
  // TODO: If the user wanted the slug to be changed, visit the meta page
  // (append "/edit/meta"), modify the slug, and save the form. Then, navigate
  // to the view of the page (remove "/edit/meta").

  // TODO: getSlugForTitle doesn't work the way we expect yet on the _view_
  // page.
}

alertOnError(() => {
  // Get the number of viewers.
  navigateToPostViewOnWriteAs();
  const numViewers = getNumViewers();

  // Help the user set a new title and tags, if desired.
  blog.navigateToEditPage();
  blog.insertTags();
  showInstructionsEditTitleAndTags();

  // When the user types ALT+C, verify that the content looks okay and apply the
  // new slug if the user wants to.
  onDoneEditingKeystroke(() => {
    verifyOneSetOfTags();
    publishChangesOrNavigateToView();
    conditionallyApplyNewSlug(numViewers);
  });
});
