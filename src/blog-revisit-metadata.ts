/**
 * Revisit and potentially change the title, tags, and/or slug of a single blog
 * post.
 *
 * Precondition: This bookmarklet must be run on the edit page of a single blog
 * post.
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
import StepRunner, {
  SetNextStepNumberFunction,
} from "./utils/classes/StepRunner.ts";
import { alertOnError, log } from "./utils/general.ts";
import * as dom from "./utils/dom.ts";
import * as navigation from "./utils/navigation.ts";
import * as blog from "./utils/blog.ts";

const ssKeyPrefix: string = "blog-revisit-metadata__";

const ssKeyNewSlug: string = ssKeyPrefix + "new-slug";

const stepRunner: StepRunner = new StepRunner(ssKeyPrefix);

type FinalAlertAdditions = {
  before?: string;
  after?: string;
};

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
// This function is unused for now, because I'm using the bookmarklet so
// frequently that I don't need this reminder, but it will be enable again in
// the future.
//
// deno-lint-ignore no-unused-vars
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
 * Remove all sessionStorage items created by this bookmarklet.
 */
function clearSessionStorage(): void {
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
  stepRunner.cleanUp();

  // This isn't important enough to show in the alert, but it's good to know, so
  // print it to the console.
  log("All state has been cleaned up.");
}

/**
 * Clean up, explain that update is complete, and check for broken links.
 *
 * This function should be run whether the bookmarklet completes its execution
 * **successfully**.
 *
 * @param successMessageAdditions - Strings that should be added before or after
 *                                  the alert message about the bookmarklet
 *                                  completing its work successfully. Omit the
 *                                  argument entirely to not modify the alert
 *                                  message.
 */
function finalize(successMessageAdditions?: FinalAlertAdditions): void {
  cleanUp();

  let successMessage: string = "The metadata update is complete.";

  if (successMessageAdditions?.before !== undefined) {
    successMessage = `${successMessageAdditions.before}\n` +
      "\n" +
      successMessage;
  }

  if (successMessageAdditions?.after !== undefined) {
    successMessage = `${successMessage}\n` +
      "\n" +
      successMessageAdditions.after;
  }

  alert(successMessage);

  const brokenInternalLinkHrefs: string[] = blog.getBrokenInternalLinkHrefs();

  if (brokenInternalLinkHrefs.length > 0) {
    alert(
      "NOTE: This blog post has some broken internal links to the following " +
        "URLs:\n" +
        "\n" +
        brokenInternalLinkHrefs.join("\n\n"),
    );
  }
}

/**
 * Run the first step.
 *
 * In the first step, tags are inserted and the user is prompted to edit the
 * tags and title as desired.
 *
 * @param setNextStepNumberFn - A function to run near the end of this step to
 *                              indicate that the next step is ready to be run.
 */
function step1(setNextStepNumberFn: SetNextStepNumberFunction): void {
  if (!blog.isBlogPostEditPage(window.location.href)) {
    throw new BookmarkletError(
      "This bookmarklet must be run on the edit page of a single blog post.",
    );
  }

  // TODO: Uncomment this when I'm not using it so consistently.
  //
  // At the time of this writing, I'm using this bookmarklet frequently enough
  // that I don't need this reminder.
  // alertAboutMultipleSteps();

  blog.insertTags();

  // TODO: Uncomment this at some point. At the moment, I'm using the
  // bookmarklet frequently enough that I don't need this reminder.
  //
  // showInstructionsEditTitleAndTags();

  setNextStepNumberFn();
}

/**
 * Run the second step.
 *
 * In the second step, the blog post being edited is confirmed to have only one
 * set of tags.
 *
 * @param setNextStepNumberFn - A function to run near the end of this step to
 *                              indicate that the next step is ready to be run.
 */
async function step2(
  setNextStepNumberFn: SetNextStepNumberFunction,
): Promise<void> {
  const tagsVerified: boolean = await oneSetOfTags();
  if (tagsVerified === true) {
    setNextStepNumberFn();
    await publishChanges();
  }
}

/**
 * Run the third step.
 *
 * In the third step, a new slug is generated based on the title of the blog
 * post. If the new slug is the same as the old slug, the user is notified of
 * that fact and the bookmarklet completes its work. If the new slug is
 * different than the old slug, the user is given the option of switching to the
 * new slug.
 *
 * In WriteFreely, old slugs do not redirect to new slugs, so the user is told
 * how many viewers the blog post has had before they decide whether they would
 * like to change the slug. If the post has had many views, the user may decide
 * that they do not want to change the slug.
 *
 * @param setNextStepNumberFn - A function to run near the end of this step to
 *                              indicate that the next step is ready to be run.
 */
async function step3(
  setNextStepNumberFn: SetNextStepNumberFunction,
): Promise<void> {
  const viewerCount: number = await getViewerCount();

  const currentSlug: string = blog.getSlug();
  const newSlug: string | null = await blog.slugifyTitle();

  if (newSlug === null) {
    throw new BookmarkletError("A new slug could not be generated.");
  } else if (newSlug === currentSlug) {
    finalize({ before: "The slug would not be changed." });
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
      setNextStepNumberFn();
      blog.navigateToEditMetaPage();
    } else {
      finalize({ before: "The slug will not be changed." });
    }
  }
}

/**
 * Run the fourth step.
 *
 * In the fourth step, the new slug is applied. This step is only run if the
 * user chose to switch to the new slug.
 *
 * @param setNextStepNumberFn - A function to run near the end of this step to
 *                              indicate that the next step is ready to be run.
 */
async function step4(
  setNextStepNumberFn: SetNextStepNumberFunction,
): Promise<void> {
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

  setNextStepNumberFn();

  form.submit();
}

/**
 * Run the fifth step.
 *
 * In the fifth step, a message is shown indicating that the metadata update is
 * complete and that the browser will navigate to the view page of the blog
 * post. Then, the browser performs that navigation.
 */
function step5(): void {
  finalize({ after: "Navigating to the view page of this blog post…" });
  navigation.removeFromCurrentPathnameAndNavigate("/edit/meta");
}

stepRunner.addStep(step1);
stepRunner.addStep(step2);
stepRunner.addStep(step3);
stepRunner.addStep(step4);
stepRunner.addStep(step5);

alertOnError(async () => {
  try {
    await stepRunner.runCurrentStep();
  } catch (err: unknown) {
    cleanUp();
    throw err;
  }
});
