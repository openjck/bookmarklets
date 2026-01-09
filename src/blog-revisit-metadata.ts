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

import * as dom from "./utils/dom.ts";
import * as navigation from "./utils/navigation.ts";
import * as blog from "./utils/blog.ts";
import { alertOnError } from "./utils/general.ts";

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
async function getViewerCount(): Promise<number> {
  const viewsTextContent: dom.NonNullElementProperty<"textContent"> = await dom
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
async function verifyOneSetOfTags(): Promise<void> {
  const writingArea: HTMLTextAreaElement = await blog.getWritingArea();
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

async function publishChanges(): Promise<void> {
  const publishButton: HTMLButtonElement = await dom.getElement<
    HTMLButtonElement
  >("button#publish");
  publishButton.click();
}

async function changeSlug(newSlug: string): Promise<void> {
  blog.navigateToEditMetaPage();

  const slugField: HTMLInputElement = await dom.getElement<HTMLInputElement>(
    "input#slug",
  );

  const form: HTMLFormElement = await dom.getElement<HTMLFormElement>("form");

  slugField.value = newSlug;

  form.submit();

  navigation.removeFromCurrentPathnameAndNavigate("/edit/meta");
}

async function conditionallyApplyNewSlug(viewerCount: number): Promise<void> {
  const currentSlug = blog.getSlug();
  const newSlug = await blog.getSlugForTitle();

  if (newSlug === null) {
    throw new Error("A new slug could not be generated.");
  } else if (newSlug === currentSlug) {
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
      await changeSlug(newSlug);
    } else {
      alert("The slug will not be changed.");
    }
  }
}

alertOnError(async () => {
  // FIXME: This doesn't work because JavaScript stops executing before a page
  // navigation, and it does not resume executing on the page that is loaded.
  //
  // Bookmarklets may not be the best tool for what I'm trying to achieve here.
  // Perhaps some kind of browser automation like Selenium or Playwright would
  // be better. Maybe add-ons like Greasemonkey have a pattern for dealing with
  // this situation, since I'm sure users of those add-ons have run into this
  // problem.
  //
  // A workaround might be to create multiple bookmarklets for this purpose, one
  // for each page, and to execute them one-after-another after page navigation.

  // Get the number of viewers.
  navigateToPostViewOnWriteAs();
  const viewerCount: number = await getViewerCount();

  // Help the user set a new title and tags, if desired.
  blog.navigateToEditPage();

  blog.insertTags();
  showInstructionsEditTitleAndTags();

  // When the user presses "ALT+C", verify that the content looks okay, ask the
  // user if they want to change the slug, and change the slug if they want to.
  onDoneEditingKeystroke(async () => {
    await verifyOneSetOfTags();
    await publishChanges();
    await conditionallyApplyNewSlug(viewerCount);
    alert("The metadata update is complete!");
  });
});
