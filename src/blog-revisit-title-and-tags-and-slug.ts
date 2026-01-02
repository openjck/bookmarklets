/**
 * Revisit and potentially change the title, tags, and/or slug of a single blog
 * post.
 *
 * This bookmarklet must be run on the view page of a single blog post, on
 * either domain.
 *
 * I want to revisit these things because I only really started using titles
 * halfway through the thoughts migration, and I only really finalized my tag
 * vocabulary very close to the end.
 */

import { alertOnError } from "./utils/general";
import * as blog from "./utils/blog";

/**
 * Navigate to the view page of a blog post on the write.as domain.
 *
 * This function must be run on the view page of a single blog post, on either
 * domain.
 */
function navigateToPostViewOnWriteAs() {
  if (atBaseUrl(baseUrls.johnKarahalis)) {
    navigate(
      document.URL.replace(baseUrls.johnKarahalis, baseUrls.writeAs),
    );
  }
}

/**
 * Get the number of viewers of the currently-loaded blog post.
 *
 * This function must be run while on the view page of a single blog post on the
 * write.as domain.
 */
function getNumViewers() {
  const viewSpan = document.querySelector("#post .views");
  return Number(viewSpan.textContent.split(" ")[0]);
}

/**
 * Explain the manual steps that must be taken to modify the title and tags.
 */
function showInstructionsEditTitleAndTags() {
  alert(
    "Manual step:\n\n" +
      "Modify the title and tags as desired.\n" +
      "\n" +
      'Press "ALT+C" (think "C" for "Continue") when done.',
  );
}

/**
 * Run a function when "ALT+C" is pressed.
 */
function onDoneEditingKeystroke(fn) {
  document.addEventListener("keydown", (e) => {
    if (e.altKey === true && e.key.toLowerCase() === "c") {
      e.preventDefault();
      fn();
    }
  });
}

/**
 * Verify that the blog post being edited contains exactly one set of tags.
 *
 * If fewer or greater than one set of tags is found, prompt the user to use
 * exactly one set of tags and subsequently press "ALT+C", then run this
 * function again after "ALT+C" is pressed.
 *
 * This function must be run on the edit page of a single blog post.
 */
function verifyOneSetOfTags() {
  const numSetsOfTags = blog.getWritingArea().value.match(/\n\s*#/g).length;

  if (numSetsOfTags !== 1) {
    alert(
      `There must be one set of tags, but ${numSetsOfTags} sets exist.\n` +
        "\n" +
        'Use exactly one set of tags, then press "ALT+C" to continue.',
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

  // TODO: Use getSlugForTitle() as part of this function.
}

alertOnError(() => {
  // Get the number of viewers.
  navigateToPostViewOnWriteAs();
  const numViewers = getNumViewers();

  // Help the user set a new title and tags, if desired.
  blog.navigateToEditPage();
  blog.insertTags();
  showInstructionsEditTitleAndTags();

  // When the user presses ALT+C, verify that the content looks okay and apply
  // the new slug if the user wants to.
  onDoneEditingKeystroke(() => {
    verifyOneSetOfTags();
    publishChangesOrNavigateToView();
    conditionallyApplyNewSlug(numViewers);
  });
});
