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

import { alertOnError } from "./utils/general.ts";
import * as dom from "./utils/dom.ts";
import * as navigation from "./utils/navigation.ts";
import * as blog from "./utils/blog.ts";

/**
 * Navigate to the view page of a blog post on the write.as domain.
 *
 * This function must be run on the view page of a single blog post, on either
 * domain.
 */
function navigateToPostViewOnWriteAs(): void {
  if (navigation.atBaseUrl(blog.baseUrls.johnKarahalis)) {
    blog.toggleDomain();
  }
}

/**
 * Get the number of viewers of the currently-loaded blog post.
 *
 * This function must be run while on the view page of a single blog post on the
 * write.as domain.
 */
function getViewerCount(): number {
  const viewsTextContent: dom.NonNullElementProperty<"textContent"> = dom
    .getNonNullElementProperty<HTMLSpanElement, "textContent">(
      "#post .views",
      "textContent",
    );

  // Get the number of viewers, ignoring the word "views" and the space between
  // the number and the word.
  const viewerCountStr: string = viewsTextContent.split(" ")[0];

  return Number(viewerCountStr);
}

/**
 * Explain the manual steps that must be taken to modify the title and tags.
 */
function showInstructionsEditTitleAndTags(): void {
  alert(
    "Manual step: Modify the title and tags as desired.\n" +
      "\n" +
      'Press "ALT+C" (think "C" for "Continue") when done.',
  );
}

/**
 * Run a function when "ALT+C" is pressed.
 */
function onDoneEditingKeystroke(fn: () => void): void {
  document.addEventListener("keydown", (e: KeyboardEvent) => {
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
function verifyOneSetOfTags(): void {
  const writingArea: HTMLTextAreaElement = blog.getWritingArea();
  const matches: RegExpMatchArray | null = writingArea.value.match(/\n\s*#/g);
  const numSetsOfTags: number = matches === null ? 0 : matches.length;

  if (numSetsOfTags !== 1) {
    alert(
      `There must be one set of tags, but ${numSetsOfTags} sets exist.\n` +
        "\n" +
        'Use exactly one set of tags, then press "ALT+C" to continue.',
    );
    onDoneEditingKeystroke(verifyOneSetOfTags);
  }
}

function publishChanges(): void {
  const publishButton: HTMLButtonElement = dom.getElement<HTMLButtonElement>(
    "button#publish",
  );
  publishButton.click();
}

function changeSlug(newSlug: string): void {
  blog.navigateToEditMetaPage();

  const slugField: HTMLInputElement = dom.getElement<HTMLInputElement>(
    "input#slug",
  );

  const form: HTMLFormElement = dom.getElement<HTMLFormElement>("form");

  slugField.value = newSlug;

  form.submit();

  navigation.removeFromCurrentPathAndNavigate("/edit/meta");
}

function conditionallyApplyNewSlug(viewerCount: number): void {
  const currentSlug = blog.getSlug();
  const newSlug = blog.getSlugForTitle();

  if (newSlug === currentSlug) {
    alert("The slug would not be changed.");
  } else {
    const confirmationMessage = `There have been ${viewerCount} viewers.\n` +
      "\n" +
      "The current slug is:\n" +
      `${currentSlug}\n` +
      "\n" +
      "The new slug would be:\n" +
      `${newSlug}\n` +
      "\n" +
      'Press "OK" to change the slug or "Cancel" to leave it unchanged.';

    if (window.confirm(confirmationMessage)) {
      changeSlug(newSlug);
    } else {
      alert("The slug will not be changed.");
    }
  }
}

alertOnError((): void => {
  // Get the number of viewers.
  navigateToPostViewOnWriteAs();
  const viewerCount = getViewerCount();

  // Help the user set a new title and tags, if desired.
  blog.navigateToEditPage();
  blog.insertTags();
  showInstructionsEditTitleAndTags();

  // When the user presses "ALT+C", verify that the content looks okay, ask the
  // user if they want to change the slug, and change the slug if they want to.
  onDoneEditingKeystroke(() => {
    verifyOneSetOfTags();
    publishChanges();
    conditionallyApplyNewSlug(viewerCount);
    alert("The metadata update is complete!");
  });
});
