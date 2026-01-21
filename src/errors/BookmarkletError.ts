/**
 * Options for configuring the behavior of a BookmarkletError.
 *
 * @property forEndUser - Whether the error message should be shown to the end
 *                        user.
 */
export type BookmarkletErrorOptions = {
  forEndUser: boolean;
};

/**
 * An error that can be raised about a failure in the bookmarklet.
 */
export default class BookmarkletError extends Error {
  /**
   * Construct a new instance.
   *
   * @param message - The error message.
   * @param options - Options for configuring the behavior of the error.
   */
  constructor(
    message: string,
    public options: BookmarkletErrorOptions = { forEndUser: true },
  ) {
    super(message);
    this.options = options;
  }
}
