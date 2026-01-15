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
 * TODO: Write JSDoc. By doing it here, I don't need to document it in "revisit"
 * when using addStep().
 */
export type StepFunction = (
  setNextStepNumberFn: SetNextStepNumberFunction,
) => void | Promise<void>;

/**
 * TODO: Write JSDoc
 */
export default class StepRunner {
  #sessionStorageStepKey: string;
  #nextStepNumber: number;
  #steps: Record<number, StepFunction>;

  /**
   * TODO: Write JSDoc
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
   * TODO: Write JSDoc
   */
  addStep(stepFn: StepFunction) {
    this.#steps[this.#nextStepNumber] = stepFn;
    this.#nextStepNumber = this.#nextStepNumber + 1;
  }

  /**
   * TODO: Write JSDoc
   */
  async runCurrentStep() {
    const currentStepNumber: number = this.#getCurrentStepNumber();
    const nextStepNumber: number = currentStepNumber + 1;

    await this.#steps[currentStepNumber]((): void => {
      this.#setStepNumber(nextStepNumber);
    });
  }

  /**
   * TODO: Write JSDoc
   */
  cleanUp() {
    sessionStorage.removeItem(this.#sessionStorageStepKey);
  }

  /**
   * TODO: Rewrite JSDoc. It came from the old "revisit" file.
   *
   * Record, in sessionStorage, the number of the next step to complete.
   *
   * @param stepNumber - The number of the next step that must be completed.
   */
  #setStepNumber(stepNumber: number): void {
    sessionStorage.setItem(this.#sessionStorageStepKey, String(stepNumber));
  }

  /**
   * TODO: Rewrite JSDoc. It came from the old "revisit" file.
   *
   * Return the current step number recorded in sessionStorage.
   *
   * If the current step number is not recorded in sessionStorage, return `null`.
   * Otherwise, return the step number as a number.
   */
  #getCurrentStepNumber(): number {
    const nextStepNumberRaw: string | null = sessionStorage.getItem(
      this.#sessionStorageStepKey,
    );

    if (nextStepNumberRaw === null) {
      return 1;
    }

    return Number(nextStepNumberRaw);
  }
}
