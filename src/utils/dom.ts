export function getElement<T extends Element>(selector: string): T {
  const element: T | null = document.querySelector(selector);

  if (element === null) {
    throw new Error(`Cannot find element by selector "${selector}".`);
  }

  return element;
}

export function getElementAttribute<ElementType extends Element>(
  selector: string,
  attribute: string,
): string {
  const element: ElementType = getElement<ElementType>(selector);
  const attributeValue: string | null = element.getAttribute(attribute);

  if (attributeValue === null) {
    throw new Error(
      `Property "${attribute}" of element found with selector "${selector}" ` +
        "is null.",
    );
  }

  return attributeValue;
}
