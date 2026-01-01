/**
 * Purpose: Revisit and potentially change the title, tags, and slug of a single
 * blog post. I want to do this because I only really got into the habit of
 * using a title halfway through the thoughts migration, and I changed the tags
 * that I use close to the end of the thoughts migration.
 */

import { insertTags } from "./utils/blog";
import { alertOnError } from "./utils/general";

function navigateToPostViewOnWriteAs() {
  alert(
    "TODO: Automate.\n\nNavigate to the current blog post on the write.as domain if we are not on the write.as domain already.",
  );
}

function getNumViewers() {
  alert("TODO: Automate.\n\nTake note of how many viewers there have been.");
  return "unknown";
}

function navigateToPostEditOnWriteAs() {
  // TODO: Just append /edit.
  alert("TODO: Automate.\n\nNavigate to the edit page for the post.");
}

function showInstructionsEditTitleAndTags() {
  alert(
    "Manual step:\n\n" +
      "Edit the title and tags as necessary.\n\n" +
      `Type "ALT+C" (think "C" for "Continue") when done.`,
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
  alert(
    "TODO: Automate.\n\nVerify that there is only one set of tags. Hit the keystroke again to proceed.",
  );

  // TODO: If there are two sets of tags, tell the user that there are and tell
  // them to hit the keystroke again once the problem is fixed.
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
  navigateToPostEditOnWriteAs();
  insertTags();
  showInstructionsEditTitleAndTags();

  // When the user types ALT+C, verify that the content looks okay and apply the
  // new slug if the user wants to.
  onDoneEditingKeystroke(() => {
    verifyOneSetOfTags();
    publishChangesOrNavigateToView();
    conditionallyApplyNewSlug(numViewers);
  });
});
