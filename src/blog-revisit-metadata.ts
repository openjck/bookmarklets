/**
 * Revisit and potentially change the title, tags, and/or slug of a single blog
 * post.
 *
 * Precondition: This bookmarklet must be run on the view page of a single blog
 * post on the write.as domain.
 *
 * I want to revisit these things because I only really started using titles
 * halfway through the thoughts migration, and I only really finalized my tag
 * vocabulary very close to the end.
 *
 * In hindsight, this probably should have been some kind of Selenium or other
 * browser automation script, because bookmarklet execution does not persist
 * across page loads. I didn't think of that when I started writing this. The
 * workaround (clicking the bookmarklet multiple times) works, but it's annoying
 * and the implementation is also a bit odd.
 */

import BookmarkletError from "./errors/BookmarkletError.ts";
import { alertOnError } from "./utils/general.ts";
import * as dom from "./utils/dom.ts";
import * as navigation from "./utils/navigation.ts";
import * as blog from "./utils/blog.ts";

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
      "Click the bookmarklet again when done.",
  );
}

/**
 * TODO: Function signature changed; this needs updating.
 *
 * Verify that the blog post being edited contains exactly one set of tags.
 *
 * Precondition: This function must be run on the edit page of a single blog
 * post.
 *
 * If fewer or greater than one set of tags is found, prompt the user to use
 * exactly one set of tags and subsequently click the bookmarklet again, then
 * run this function again after.
 */
async function oneSetOfTags(): Promise<boolean> {
  const writingArea: HTMLTextAreaElement = await blog.getWritingArea();
  const matches: RegExpMatchArray | null = writingArea.value.match(/\n\s*#/g);
  const numSetsOfTags: number = matches === null ? 0 : matches.length;

  if (numSetsOfTags !== 1) {
    alert(
      `There must be exactly 1 set of tags, but ${numSetsOfTags} sets ` +
        "exist.\n" +
        "\n" +
        "Click the bookmarklet again to continue.",
    );
    return false;
  }

  return true;
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

const completedMessage: string = "The metadata update is complete!";

function getStepNumber(): number | null {
  const sessionStoragePageNumber: string | null = sessionStorage.getItem(
    ssKeyPage,
  );

  if (sessionStoragePageNumber === null) {
    return null;
  }

  return Number(sessionStoragePageNumber);
}

function setNextStep(stepNumber: number) {
  sessionStorage.setItem(ssKeyPage, String(stepNumber));
}

function emptySessionStorage(): void {
  sessionStorage.removeItem(ssKeyPage);
  sessionStorage.removeItem(ssKeyViewerCount);
  sessionStorage.removeItem(ssKeyNewSlug);
}

function finalize(): void {
  emptySessionStorage();
}

alertOnError(async () => {
  try {
    const stepNumber: number | null = getStepNumber();

    if (stepNumber === null) {
      const viewerCount: number = await getViewerCount();
      sessionStorage.setItem(ssKeyViewerCount, String(viewerCount));
      setNextStep(2);
      blog.navigateToEditPage();
    } else if (stepNumber === 2) {
      blog.insertTags();
      showInstructionsEditTitleAndTags();
      setNextStep(3);
    } else if (stepNumber === 3) {
      const tagsVerified: boolean = await oneSetOfTags();
      if (tagsVerified === true) {
        setNextStep(4);
        await publishChanges();
      }
    } else if (stepNumber === 4) {
      const viewerCountSessionStorage: string | null = sessionStorage.getItem(
        ssKeyViewerCount,
      );

      if (viewerCountSessionStorage === null) {
        throw new BookmarkletError(
          "Cannot retrieve viewer count from session storage.",
        );
      }

      const viewerCount: number = Number(viewerCountSessionStorage);

      const currentSlug: string = blog.getSlug();
      const newSlug: string | null = await blog.getSlugForTitle();

      if (newSlug === null) {
        throw new BookmarkletError("A new slug could not be generated.");
      } else if (newSlug === currentSlug) {
        alert(
          "The slug would not be changed.\n" +
            "\n" +
            completedMessage,
        );
        finalize();
      } else {
        let viewerMessage: string;
        if (viewerCount === 1) {
          viewerMessage = "There has been 1 viewer.";
        } else {
          viewerMessage = `There have been ${viewerCount} viewers.`;
        }

        const confirmationMessage = `${viewerMessage}\n` +
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
          setNextStep(5);
          blog.navigateToEditMetaPage();
        } else {
          alert(
            "The slug will not be changed.\n" +
              "\n" +
              completedMessage,
          );
          finalize();
        }
      }
    } else if (stepNumber === 5) {
      const newSlug: string | null = sessionStorage.getItem(ssKeyNewSlug);

      if (newSlug === null) {
        throw new BookmarkletError(
          "Cannot retrieve new slug from session storage.",
        );
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
      setNextStep(6);
      form.submit();
    } else if (stepNumber === 6) {
      setNextStep(7);
      navigation.removeFromCurrentPathnameAndNavigate("/edit/meta");
    } else if (stepNumber === 7) {
      alert(completedMessage);
      finalize();
    }
  } catch (err: unknown) {
    emptySessionStorage();
    throw err;
  }
});
