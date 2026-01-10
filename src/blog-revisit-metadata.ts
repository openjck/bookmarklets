/**
 * Revisit and potentially change the title, tags, and/or slug of a single blog
 * post.
 *
 * Precondition: This bookmarklet must be run on the view page of a single blog
 * post, on either domain.
 *
 * I want to revisit these things because I only really started using titles
 * halfway through the thoughts migration, and I only really finalized my tag
 * vocabulary very close to the end.
 */

import BookmarkletError from "./errors/BookmarkletError.ts";
import { alertOnError } from "./utils/general.ts";
import * as dom from "./utils/dom.ts";
import * as navigation from "./utils/navigation.ts";
import * as blog from "./utils/blog.ts";

/**
 * Navigate to the view page of a blog post on the write.as domain.
 *
 * Precondition: This function must be run on the view page of a single blog
 * post, on either domain.
 */
function navigateToPostViewOnWriteAs(): void {
  if (navigation.atBaseUrl(blog.baseUrls.johnKarahalis)) {
    blog.toggleDomain();
  }
}

/**
 * Get the number of viewers of the currently-loaded blog post.
 *
 * The number that is returned is reported by write.as according to its own
 * statistics.
 *
 * Precondition: This function must be run while on the view page of a single
 * blog post, on the write.as domain.
 *
 * @return A promise that resolves to the number of viewers of the
 *         currently-loaded blog post, according to write.as statistics.
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
 * Run a function when the "done editing" keystroke (ALT+C) is pressed.
 *
 * @param fn - The function to run when the "done editing" keystroke is pressed.
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
 * Precondition: This function must be run on the edit page of a single blog
 * post.
 *
 * If fewer or greater than one set of tags is found, prompt the user to use
 * exactly one set of tags and subsequently use the "done editing" keystroke
 * (ALT+C), then run this function again after the keystroke is pressed.
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

/**
 * Publish changes currently shown on the edit page.
 */
async function publishChanges(): Promise<void> {
  const publishButton: HTMLButtonElement = await dom.getElement<
    HTMLButtonElement
  >("button#publish");
  publishButton.click();
}

// TODO: Everything below this point is messy on purpose. I want to get this
// bookmarklet to work, then refactor it only after a multi-page pattern has
// emerged.

const ssKeyPrefix: string = "blog-revisit-metadata__";

const ssKeyPage: string = ssKeyPrefix + "page";
const ssKeyViewerCount: string = ssKeyPrefix + "viewer-count";
const ssKeyNewSlug: string = ssKeyPrefix + "new-slug";

function getPageNumber(): number | null {
  const sessionStoragePageNumber: string | null = sessionStorage.getItem(
    ssKeyPage,
  );

  if (sessionStoragePageNumber === null) {
    return null;
  }

  return Number(sessionStoragePageNumber);
}

function setNextPage(pageNumber: number) {
  sessionStorage.setItem(ssKeyPage, String(pageNumber));
}

function emptySessionStorage(): void {
  sessionStorage.removeItem(ssKeyPage);
  sessionStorage.removeItem(ssKeyViewerCount);
  sessionStorage.removeItem(ssKeyNewSlug);
}

function finalize(): void {
  emptySessionStorage();
  alert("The metadata update is complete!");
}

alertOnError(async () => {
  try {
    const pageNumber: number | null = getPageNumber();

    if (pageNumber === null) {
      setNextPage(2);
      navigateToPostViewOnWriteAs();
    } else if (pageNumber === 2) {
      const viewerCount: number = await getViewerCount();
      sessionStorage.setItem(ssKeyViewerCount, String(viewerCount));
      setNextPage(3);
      blog.navigateToEditPage();
    } else if (pageNumber === 3) {
      blog.insertTags();
      showInstructionsEditTitleAndTags();

      onDoneEditingKeystroke(async () => {
        await verifyOneSetOfTags();
        setNextPage(4);
        await publishChanges();
      });
    } else if (pageNumber === 4) {
      const viewerCount: number = Number(
        sessionStorage.getItem(ssKeyViewerCount),
      );

      const currentSlug = blog.getSlug();
      const newSlug = await blog.getSlugForTitle();

      if (newSlug === null) {
        throw new BookmarkletError("A new slug could not be generated.");
      } else if (newSlug === currentSlug) {
        alert("The slug would not be changed.");
        finalize();
      } else {
        const confirmationMessage =
          `There have been ${viewerCount} viewers.\n` +
          "\n" +
          "The current slug is:\n" +
          `${currentSlug}\n` +
          "\n" +
          "The new slug would be:\n" +
          `${newSlug}\n` +
          "\n" +
          'Press "OK" to change the slug or "Cancel" to leave it unchanged.';

        if (window.confirm(confirmationMessage)) {
          sessionStorage.setItem(ssKeyNewSlug, newSlug);
          setNextPage(5);
          blog.navigateToEditMetaPage();
        } else {
          alert("The slug will not be changed.");
          finalize();
        }
      }
    } else if (pageNumber === 5) {
      const newSlug: string | null = sessionStorage.getItem(ssKeyNewSlug);

      if (newSlug === null) {
        throw new BookmarkletError("Cannot get new slug from session storage.");
      }

      const slugField: HTMLInputElement = await dom.getElement<
        HTMLInputElement
      >(
        "input#slug",
      );

      const form: HTMLFormElement = await dom.getElement<HTMLFormElement>(
        "form",
      );

      slugField.value = newSlug;

      setNextPage(6);
      form.submit();
    } else if (pageNumber === 6) {
      setNextPage(7);
      navigation.removeFromCurrentPathnameAndNavigate("/edit/meta");
    } else if (pageNumber === 7) {
      finalize();
    }
  } catch (err: unknown) {
    emptySessionStorage();
    throw err;
  }
});
