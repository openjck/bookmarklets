export type BookmarkletErrorOptions = {
  forEndUser: boolean;
};

export default class BookmarkletError extends Error {
  constructor(
    message: string,
    public options: BookmarkletErrorOptions = { forEndUser: true },
  ) {
    super(message);
    this.options = options;
  }
}
