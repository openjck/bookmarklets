export type NonNullElementProperty<ElementKey extends keyof Element> =
  NonNullable<Element[ElementKey]>;

/**
 * Return a promise that resolves to an element or rejects with an `Error`.
 *
 * This function is based on the following Stack Overflow answer:
 *
 * https://stackoverflow.com/a/61511955/715866
 *
 * Additionally, ChatGPT offered help in implementing a timeout.
 *
 * @param selector - A unique selector for the element, in the same format that
 *                   is accepted by `document.querySelector()`.
 * @param [timeout=0] - A time duration in milliseconds, after which the promise
 *                      should reject with an `Error` if the element could not
 *                      be found.
 *
 * @returns A promise which either resolves to the first element in the document
 *          matching the provided selector, if one can be found before the
 *          `timeout` passes, or which rejects with an `Error`.
 */
export function getElement<T extends Element>(
  selector: string,
  timeout: number = 0,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const element: T | null = document.querySelector(selector);
    if (element !== null) {
      return resolve(element);
    }

    const observer = new MutationObserver(() => {
      const element: T | null = document.querySelector(selector);
      if (element !== null) {
        observer.disconnect();
        clearTimeout(timer);
        return resolve(element);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    const timer = setTimeout(() => {
      observer.disconnect();
      return reject(new Error(`Cannot find element by selector ${selector}.`));
    }, timeout);
  });
}

/**
 * Return a promise that resolves to a non-null element property value.
 *
 * If the element cannot be found or the element's property value is null,
 * reject with an `Error`.
 *
 * @param selector - A unique selector for the element, in the same format that
 *                   is taken by `document.querySelector()`.
 * @param property - The name of the property whose value should be returned.
 * @param [timeout=0] - A time duration in milliseconds, after which the promise
 *                      should reject with an `Error` if the element could not
 *                      be found.
 *
 * @returns A promise which either resolves to the attribute value of the first
 *          element in the document matching the provided selector, if one can
 *          be found before the `timeout` passes and its attribute value is
 *          non-null, or which rejects with an `Error`.
 */
export async function getNonNullElementProperty<
  ElementType extends Element,
  ElementKey extends keyof Element,
>(
  selector: string,
  property: ElementKey,
  timeout: number = 0,
): Promise<NonNullElementProperty<ElementKey>> {
  const element: ElementType = await getElement<ElementType>(selector, timeout);
  const attributeValue: Element[ElementKey] = element[property];

  if (attributeValue === null) {
    throw new Error(
      `Property "${property}" of element found with selector "${selector}" ` +
        "is null.",
    );
  }

  return attributeValue as NonNullElementProperty<ElementKey>;
}
