/**
 * Return an element or throw an `Error` about not being able to find it.
 *
 * @param selector - A unique selector for the element, in the same format that
 *                   is taken by `document.querySelector()`.
 *
 * @throws {Error} if the element cannot be found
 * @returns The first element in the document that matches the provided
 *          selector.
 */
export function getElement<T extends Element>(selector: string): T {
  const element: T | null = document.querySelector(selector);

  if (element === null) {
    throw new Error(`Cannot find element by selector "${selector}".`);
  }

  return element;
}

/**
 * Return the non-null attribute value of an element or throw an `Error`.
 *
 * @param selector - A unique selector for the element, in the same format that
 *                   is taken by `document.querySelector()`.
 * @param property - The name of the property whose value should be returned.
 *
 * @throws {Error} if the element cannot be found or the value of the provided
 *                 attribute is null
 * @returns The non-null value of the provided attribute for the first element
 *          in the document that matched the provided selector.
 */
export function getNonNullElementAttribute<ElementType extends Element>(
  selector: string,
  property: string,
): string {
  const element: ElementType = getElement<ElementType>(selector);
  const attributeValue: string | null = element[property];

  if (attributeValue === null) {
    throw new Error(
      `Property "${property}" of element found with selector "${selector}" ` +
        "is null.",
    );
  }

  return attributeValue;
}
