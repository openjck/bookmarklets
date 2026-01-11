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

const ssKeyPrefix: string = "blog-revisit-metadata__";

const ssKeyPage: string = ssKeyPrefix + "page";
const ssKeyViewerCount: string = ssKeyPrefix + "viewer-count";
const ssKeyNewSlug: string = ssKeyPrefix + "new-slug";

const completedMessage: string = "The metadata update is complete!";

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
 * Return `true` if the blog post being edited contains one set of tags.
 *
 * Precondition: This function must be run on the edit page of a single blog
 * post.
 *
 * If fewer or greater than one set of tags is found, prompt the user to use
 * exactly one set of tags and subsequently click the bookmarklet again.
 *
 * @returns `true` if the blog post being edited contains exactly one set of
 *          tags, otherwise `false`.
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

/**
 * Return the current step number recorded in sessionStorage.
 *
 * If the current step number is not recorded in sessionStorage, return `null`.
 * Otherwise, return the step number as a number.
 *
 * @returns The current step number, or `null`.
 */
function getStepNumber(): number | null {
  const rawSessionStorageValue: string | null = sessionStorage.getItem(
    ssKeyPage,
  );

  if (rawSessionStorageValue === null) {
    return null;
  }

  return Number(rawSessionStorageValue);
}

/**
 * Record, in sessionStorage, the number of the next step to complete.
 *
 * @param stepNumber - The number of the next step that must be completed.
 */
function setNextStepNumber(stepNumber: number): void {
  sessionStorage.setItem(ssKeyPage, String(stepNumber));
}

/**
 * Remove all sessionStorage items created by this bookmarklet.
 */
function clearSessionStorage(): void {
  sessionStorage.removeItem(ssKeyPage);
  sessionStorage.removeItem(ssKeyViewerCount);
  sessionStorage.removeItem(ssKeyNewSlug);
}

/**
 * Clean up after this bookmarklet's main execution completes.
 *
 * This function should be run whether the bookmarklet completes its execution,
 * either successfully or unsuccessfully.
 */
function cleanUp(): void {
  clearSessionStorage();
}

const stepFunctions: Record<number, () => void> = {};

stepFunctions[1] = async (): Promise<void> => {
  const viewerCount: number = await getViewerCount();
  sessionStorage.setItem(ssKeyViewerCount, String(viewerCount));
  setNextStepNumber(2);
  blog.navigateToEditPage();
};

stepFunctions[2] = (): void => {
  blog.insertTags();
  showInstructionsEditTitleAndTags();
  setNextStepNumber(3);
};

stepFunctions[3] = async (): Promise<void> => {
  const tagsVerified: boolean = await oneSetOfTags();
  if (tagsVerified === true) {
    setNextStepNumber(4);
    await publishChanges();
  }
};

stepFunctions[4] = async (): Promise<void> => {
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
    cleanUp();
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
      setNextStepNumber(5);
      blog.navigateToEditMetaPage();
    } else {
      alert(
        "The slug will not be changed.\n" +
          "\n" +
          completedMessage,
      );
      cleanUp();
    }
  }
};

stepFunctions[5] = async (): Promise<void> => {
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
  setNextStepNumber(6);
  form.submit();
};

stepFunctions[6] = (): void => {
  setNextStepNumber(7);
  navigation.removeFromCurrentPathnameAndNavigate("/edit/meta");
};

stepFunctions[7] = (): void => {
  alert(completedMessage);
  cleanUp();
};

alertOnError(async () => {
  try {
    const stepNumber: number | null = getStepNumber();

    if (stepNumber === null) {
      await stepFunctions[1]();
    } else {
      await stepFunctions[stepNumber]();
    }
  } catch (err: unknown) {
    cleanUp();
    throw err;
  }
});
