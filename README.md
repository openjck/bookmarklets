## Introduction

These are my personal bookmarklets, written in TypeScript and built by Deno. I
use them to customize websites and programatically interact with them.

These bookmarks are currently highly particular to my own needs. In fact, at the
moment, all of them exist to help me manage my blog. It's unlikely anyone will
have any direct uses for them. Still, I always share code, even in cases like
these, because others may find some patterns or helper functions useful.

### Code others may find useful

Some code others may find useful include the following. Read the JSDoc comments
in the source files for more information about how to use them.

- The
  [`StepRunner`](https://github.com/openjck/bookmarklets/blob/32ddf3c749ea5094b1600e69416d063225731974/src/utils/classes/StepRunner.ts)
  class (permalink is from 2026-01-17) can be used to manage and run bookmarklet
  steps, where a step is some unique code that should be run each time the
  bookmarklet is clicked. JavaScript execution does not persist across page
  loads, so when a bookmarklet navigates across pages, you will probably need to
  split your logic into steps: step 1 for code that will run on the first page,
  step 2 for code that will run on the second page, etc. `StepRunner` will keep
  track of steps for you and run the appropriate step each time the bookmarklet
  is clicked.
- The
  [`getElement`](https://github.com/openjck/bookmarklets/blob/32ddf3c749ea5094b1600e69416d063225731974/src/utils/dom.ts#L6-L54)
  function (permalink is from 2026-01-17) returns a `Promise` which resolves to
  the first element that matches the given selector or which rejects after a
  specified timeout.
- Similarly, the
  [`getNonNullElementProperty`](https://github.com/openjck/bookmarklets/blob/32ddf3c749ea5094b1600e69416d063225731974/src/utils/dom.ts#L56-L93)
  function (permalink is from 2026-01-17) resolves to the property of an element
  (e.g., `textContent`) after waiting for the element to appear or rejects if
  the element cannot be found or the property is null. What makes this function
  interesting, in my opinion, is the typing. I'm no TypeScript expert, so maybe
  others with more experience wouldn't find it very interesting, but it really
  took a lot of effort for me to get the types right.

### Why not use userscripts?

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

## Build steps

1. Install [Deno](https://deno.com/).
2. Clone this repo and navigate to it's root directory.
3. Run `deno task build`.

## Usage

To use a bookmarklet, copy the compiled code of the relevant bookmarklet from
_dist/_, then create a bookmark in your browser with that code as the URL.
