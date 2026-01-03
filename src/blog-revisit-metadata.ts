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
import { atBaseUrl, navigate } from "./utils/navigation.ts";
import * as blog from "./utils/blog.ts";

/**
 * Navigate to the view page of a blog post on the write.as domain.
 *
 * This function must be run on the view page of a single blog post, on either
 * domain.
 */
function navigateToPostViewOnWriteAs(): void {
  if (atBaseUrl(blog.baseUrls.johnKarahalis)) {
    navigate(
      document.URL.replace(blog.baseUrls.johnKarahalis, blog.baseUrls.writeAs),
    );
  }
}

/**
 * Get the number of viewers of the currently-loaded blog post.
 *
 * This function must be run while on the view page of a single blog post on the
 * write.as domain.
 */
function getViewerCount(): number {
  const viewSpan = document.querySelector("#post .views");

  if (viewSpan === null || viewSpan.textContent === null) {
    throw new Error("Cannot get viewer count.");
  }

  return Number(viewSpan.textContent.split(" ")[0]);
}

/**
 * Explain the manual steps that must be taken to modify the title and tags.
 */
function showInstructionsEditTitleAndTags(): void {
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

  if (matches === null || numSetsOfTags !== 1) {
    alert(
      `There must be one set of tags, but ${numSetsOfTags} sets exist.\n` +
        "\n" +
        'Use exactly one set of tags, then press "ALT+C" to continue.',
    );
    onDoneEditingKeystroke(verifyOneSetOfTags);
  }
}

function publishChanges(): void {
  const publishButton = document.getElementById("publish");

  if (publishButton === null) {
    throw new Error('Cannot find the "Publish" button.');
  }

  publishButton.click();
}

function changeSlug(newSlug: string): void {
  navigate(document.URL + "/edit/meta");

  const slugField: HTMLInputElement | null = document.querySelector(
    "input#slug",
  );

  if (slugField === null) {
    throw new Error("Cannot find or modify slug field.");
  }

  slugField.value = newSlug;

  const form: HTMLFormElement | null = document.querySelector("form");

  if (form === null) {
    throw new Error("Cannot find form.");
  }

  form.submit();

  navigate(document.URL.replace(/\/edit\/meta$/, ""));
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
      "Would you like to change the slug?";

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

  // When the user presses ALT+C, verify that the content looks okay and apply
  // the new slug if the user wants to.
  onDoneEditingKeystroke(() => {
    verifyOneSetOfTags();
    publishChanges();
    conditionallyApplyNewSlug(viewerCount);
    alert("The metadata update is complete!");
  });
});
