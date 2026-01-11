These are my personal bookmarklets, written in TypeScript and built by Deno. I
use them to customize websites and programatically interact with them.

These bookmarklets are currently highly particular to my own usage—in fact, at
the moment, all of them exist to help me write on my blog. For that reason, it's
very unlikely that others will have a direct use for any of them. Still, I
always share code, even in cases like these, in case anyone finds some patterns
or helper functions useful. And why not? Sharing just feels good.

Many people prefer to use userscripts for this purpose, with an add-on like
[Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/).
I decided to generate bookmarklets instead because they work in all browsers,
they're synced to mobile browsers through normal browser sync functionality, and
they don't require add-ons. Userscript managers are helpful when using scripts
shared by others, when updating scripts shared by others, and when one doesn't
want to deal with a build script. None of those properties benefit me, though,
because I'm not using any shared scripts and I need a build step anyway because
I'm using TypeScript and imports. Still, I'll consider generating userscripts
and using a userscript manager in the future if the benefits ever outweigh the
costs.

## To build bookmarklets

1. Install [Deno](https://deno.com/).
2. Clone this repo and navigate to it's root directory.
3. Run `deno task build`.

## To use bookmarklets

Copy the compiled code of the relevant bookmarklet from _dist/_, then create a
bookmark in your browser with that code as the URL.
