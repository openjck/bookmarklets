/**
 * A function that should be run near the end of one step to indicate that the
 * next step is ready to be run. The next step will be run the next time the
 * bookmarklet is clicked.
 *
 * JavaScript execution does not persist across page navigation, so if a step
 * ends with navigation, this function should be called just before that
 * navigation occurs.
 */
export type SetNextStepNumberFunction = () => void;

/**
 * A function which can be run to perform on step of a bookmarklet's work.
 */
export type StepFunction = (
  setNextStepNumberFn: SetNextStepNumberFunction,
) => void | Promise<void>;

/**
 * StepRunner manages and runs functions which perform bookmarklet steps.
 */
export default class StepRunner {
  #sessionStorageStepKey: string;
  #nextStepNumber: number;
  #steps: Record<number, StepFunction>;

  /**
   * Create a new instance.
   *
   * @param sessionStoragePrefix - A prefix that should be used in the names of
   *                               session storage keys for session storage
   *                               items that are used by this class. This can
   *                               be any unique value that does not change
   *                               during the execution of the bookmarklet.
   * @param [steps] - An array of steps to initialize this class with, as an
   *                  alternative to using `addStep` later.
   */
  constructor(sessionStoragePrefix: string, steps?: StepFunction[]) {
    this.#sessionStorageStepKey = sessionStoragePrefix + "step";
    this.#nextStepNumber = 1;
    this.#steps = {};

    if (steps !== undefined) {
      steps.forEach((step: StepFunction) => {
        this.addStep(step);
      });
    }
  }

  /**
   * Add a function for performing a bookmarklet step, to be run later.
   *
   * @param stepFn - A function for performing a bookmarklet step.
   */
  addStep(stepFn: StepFunction): void {
    this.#steps[this.#nextStepNumber] = stepFn;
    this.#nextStepNumber = this.#nextStepNumber + 1;
  }

  /**
   * Run the step that should be performed during this click of the bookmarklet.
   *
   * Each time the bookmarklet is clicked, another step should be run. This
   * function runs the appropriate step, based on what is recorded as the
   * "current step" in session storage.
   */
  async runCurrentStep(): Promise<void> {
    const currentStepNumber: number = this.#getCurrentStepNumber();
    const nextStepNumber: number = currentStepNumber + 1;

    await this.#steps[currentStepNumber]((): void => {
      this.#setStepNumber(nextStepNumber);
    });
  }

  /**
   * Remove any long-lived data that was created by this class to manage state.
   *
   * Currently, this method only removes the "current step" data that is
   * recorded in session storage.
   */
  cleanUp(): void {
    sessionStorage.removeItem(this.#sessionStorageStepKey);
  }

  /**
   * Record, in session storage, the number of the next step that should be run.
   *
   * @param stepNumber - The number of the next step that should be run.
   */
  #setStepNumber(stepNumber: number): void {
    sessionStorage.setItem(this.#sessionStorageStepKey, String(stepNumber));
  }

  /**
   * Return the number of the step that should be run during this click.
   *
   * If the number of the current step is not recorded in session storage,
   * return 1. Otherwise, return the current step number according to session
   * storage.
   *
   * @returns The number of the step that should be run during this click of the
   *          bookmarklet.
   */
  #getCurrentStepNumber(): number {
    const currentStepNumberRaw: string | null = sessionStorage.getItem(
      this.#sessionStorageStepKey,
    );

    if (currentStepNumberRaw === null) {
      return 1;
    }

    return Number(currentStepNumberRaw);
  }
}
