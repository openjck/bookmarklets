These are my personal bookmarklets, written in TypeScript and built by Deno. I
use them to customize websites and programatically interact with them.

Many people prefer to use userscripts for this purpose, with an add-on like
[Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/).
For now, I decided to generate bookmarklets because they work in all browsers,
they're synced to mobile browsers through normal browser synchronization
functionality, and they don't require add-ons. I'm not sure what benefits a
userscript manager would provide over that approach, honestly, and they add some
complexity, like needing third-party services for synchronization. Still, I'll
consider using a userscript manager in the future if the benefits outweigh the
costs.

## To build bookmarklets

1. Install [Deno](https://deno.com/).
2. Clone this repo and navigate to it's root directory.
3. Run `deno task build`.

## To use bookmarklets

Copy the compiled code of the relevant bookmarklet from _dist/_, then create a
bookmark in your browser with that code as the URL.
