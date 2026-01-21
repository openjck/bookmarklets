/**
 * Revisit and potentially change the title, tags, and/or slug of a single blog
 * post.
 *
 * Precondition: This bookmarklet must be run while on the edit page of a single
 * blog post.
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
 * Return the number of sets of tags that appear in the writing area.
 *
 * Precondition: This function must be run while on the edit page of a single
 * blog post.
 *
 * @returns the number of sets of tags that appear in the writing area.
 */
async function getNumSetsOfTags(): Promise<number> {
  const writingArea: HTMLTextAreaElement = await blog.getWritingArea();

  // In this regex, the last bit ([^ #]) ensures that we do not match any
  // Markdown headings, which have multiple pound signs and/or have a space
  // after the pound sign.
  const matches: RegExpMatchArray | null = writingArea.value.match(
    /\n\s*#[^ #]/g,
  );

  const numSetsOfTags: number = matches === null ? 0 : matches.length;

  return numSetsOfTags;
}

/**
 * Return an array of write.as link URLs that appear in the writing area.
 *
 * Precondition: This function must be run while on the edit page of a single
 * blog post.
 *
 * @returns an array of write.as link URLs that appear in the writing area.
 */
async function getWriteAsLinkUrls(): Promise<string[]> {
  return await blog.getWritingAreaLinkUrlsWithBase(blog.baseUrls.blogWriteAs);
}

/**
 * Return array of broken blog.johnkarahalis.com links that are in writing area.
 *
 * Precondition: This function must be run while on the edit page of a single
 * blog post.
 *
 * @returns an array of broken blog.johnkarahalis.com link URLs that appear in
 *          the writing area.
 */
async function getBrokenPublicFacingLinkUrls(): Promise<string[]> {
  const publicFacingUrls: string[] = await blog.getWritingAreaLinkUrlsWithBase(
    blog.baseUrls.blogJohnKarahalis,
  );

  // We are currently on the write.as domain, and if we make a request to
  // blog.johnkarahalis.com, the request will fail with a CORS error. For that
  // reason, we need to convert the URLs to write.as URLs before testing if they
  // are reachable. Thankfully, any blog.johnkarahalis.com URL is also reachable
  // in its write.as form, and any blog.johnkarahalis.com URL that is
  // unreachable is also unreachable in its write.as form.
  const writeAsUrls = publicFacingUrls.map((url: string): string => {
    return url.replace(
      blog.baseUrls.blogJohnKarahalis,
      blog.baseUrls.blogWriteAs,
    );
  });

  // This can't be done in a .filter() callback because .filter() does not wait
  // for promises to resolve.
  const unreachablePublicFacingUrls: string[] = [];
  for (const writeAsUrl of writeAsUrls) {
    const isReachable = await navigation.isReachable(writeAsUrl);
    if (isReachable === false) {
      const publicFacingUrl = writeAsUrl.replace(
        blog.baseUrls.blogWriteAs,
        blog.baseUrls.blogJohnKarahalis,
      );
      unreachablePublicFacingUrls.push(publicFacingUrl);
    }
  }

  return unreachablePublicFacingUrls;
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
 * Clean up and explain that the metadata update is complete.
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
function finalize(
  successMessageAdditions?: FinalAlertAdditions,
): void {
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
      "This bookmarklet must be run while on the edit page of a single blog " +
        "post.",
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
 * In the second step, validations are run to confirm that only one set of tags
 * exist, that no write.as URLs are present in the writing area, and that no
 * broken blog.johnkarahalis.com URLs are present in the writing area. If any
 * issues are found, the user is notified to fix them and click the bookmarklet
 * again. Otherwise, the blog post is published.
 *
 * @param setNextStepNumberFn - A function to run near the end of this step to
 *                              indicate that the next step is ready to be run.
 */
async function step2(
  setNextStepNumberFn: SetNextStepNumberFunction,
): Promise<void> {
  class Step2ValidationError extends Error {}

  try {
    const numSetsOfTags: number = await getNumSetsOfTags();
    if (numSetsOfTags !== 1) {
      throw new Step2ValidationError(
        `There must be exactly 1 set of tags, but ${numSetsOfTags} sets exist.`,
      );
    }

    const writeAsLinkUrls: string[] = await getWriteAsLinkUrls();
    if (writeAsLinkUrls.length > 0) {
      throw new Step2ValidationError(
        "The following write.as link URLs were found:\n" +
          "\n" +
          writeAsLinkUrls.join("\n\n") + "\n" +
          "\n" +
          "They must be removed. This blog should only use public-facing " +
          "URLs in links so that the platform can be more easily changed in " +
          "the future, if needed.",
      );
    }

    const brokenInternalLinkUrls: string[] =
      await getBrokenPublicFacingLinkUrls();
    if (brokenInternalLinkUrls.length > 0) {
      throw new Step2ValidationError(
        "The following broken blog.johnkarahalis.com link URLs were found:\n" +
          "\n" +
          brokenInternalLinkUrls.join("\n\n") + "\n" +
          "\n" +
          "They must be removed because this blog should not have any broken " +
          "links.",
      );
    }

    // If no validation failed...
    setNextStepNumberFn();
    publishChanges();
  } catch (err: unknown) {
    if (err instanceof Step2ValidationError) {
      alert(
        `${err.message}\n` +
          "\n" +
          "Fix the problem, then click the bookmarklet again to continue.",
      );
    } else {
      throw err;
    }
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
  const currentSlug: string = blog.getSlug();
  const newSlug: string | null = await blog.slugifyTitle();

  if (newSlug === null) {
    throw new BookmarkletError("A new slug could not be generated.");
  } else if (newSlug === currentSlug) {
    finalize({ before: "The slug would not be changed." });
  } else {
    const viewerCount: number = await getViewerCount();

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
