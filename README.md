These are my personal bookmarklets, written in TypeScript and built by Deno. I
use them to customize websites and programatically interact with them.

These bookmarks are currently highly particular to my own needs. In fact, all of
them exist to help me manage my blog. It's unlikely anyone will have any direct
uses for them. Still, I always share code, even in cases like these, because
others may find some patterns or helper functions useful. The `StepRunner`
class, `getElement` method (which waits for the element to become available
within a given timeout), and the `getNonNullElementProperty` function are handy.

Some people prefer to use
[userscripts](https://en.wikipedia.org/wiki/Userscript) for things like this,
with an add-on like
[Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)
managing those userscripts. I decided to generate bookmarklets instead because
they work in all browsers, they're synced to mobile browsers through normal
browser sync functionality, and they don't require any add-ons. Userscript
managers are great when using scripts written by others, when updating scripts
written by others, and when one wants to write a quick script that doesn't need
a build step. None of those properties really benefit this project, though,
because no one else is likely to install these scripts and because I'm using
TypeScript, which requires a build step anyway.

## To build bookmarklets

1. Install [Deno](https://deno.com/).
2. Clone this repo and navigate to it's root directory.
3. Run `deno task build`.

## To use bookmarklets

Copy the compiled code of the relevant bookmarklet from _dist/_, then create a
bookmark in your browser with that code as the URL.
