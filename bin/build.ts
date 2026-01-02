import * as path from "jsr:@std/path@1.1.4";

import * as esbuild from "https://deno.land/x/esbuild@v0.27.2/mod.js";
import bookmarkletPlugin from "https://deno.land/x/esbuild_plugin_bookmarklet@v1.0.0/mod.js";

const projectRoot: string = path.dirname(import.meta.dirname);

const dirs: Record<string, string> = {
  src: path.join(projectRoot, "src"),
  dist: path.join(projectRoot, "dist"),
};

// Delete the "dist" directory if it exists.
try {
  await Deno.remove(dirs.dist, { recursive: true });
} catch (err) {
  if (err instanceof Deno.errors.NotFound) {
    // The dist directory did not exist during the attempt to remove it. That's
    // fine, and this can safely be ignored.
  } else {
    throw err;
  }
}

// Create a new, empty "dist" directory.
await Deno.mkdir(dirs.dist);

const allowedExtensions: string[] = ["js", "ts"];
const builds: Promise<esbuild.BuildResult> = [];

for await (const entry of Deno.readDir(dirs.src)) {
  // There is a Deno API for getting the _parts_ of a filename (path.parse()),
  // but I dislike it because, confusingly, the "name" property of a parsed path
  // is different _but very similar to_ the "name" property of an entry. In
  // other words, these two values would be different:
  //
  //   console.log(entry.name); // example.ts
  //
  //   const parsedEntry = path.parse(entry.name);
  //   console.log(parsedEntry.name); // example
  //
  // I find that confusing, and I'm sure it would trip me up in the future, so
  // I'm intentionally avoiding path.parse() here and getting filename parts in
  // different ways.
  const entryExtension = entry.name.split(".").pop();

  if (entry.isFile && allowedExtensions.includes(entryExtension)) {
    const outfileBasename = entry.name.replace(/\.[^.]+$/, "") + ".js";

    const infileAbsolutePath = path.join(dirs.src, entry.name);
    const outfileAbsolutePath = path.join(dirs.dist, outfileBasename);

    // For some reason, somewhat rarely, some bookmarks are not successfully
    // written to the "dist" directory. It definitely seems like an async issue,
    // but my attempts to fix it have not succeeded. I suppose it _could_ be an
    // esbuild issue or an issue with the plugin. I may need to revisit it
    // sometime with a fresh set of eyes.
    //
    // Additionally, the bookmarklet plugin does not seem to correctly support
    // multiple entrypoints. If the loop is omitted, `entryPoints` is set to
    // `sourceFiles`, `outfile` is removed, and `outdir: dirs.dist` is set, only
    // the first bookmarklet is written. That seems like it could be a bug in
    // the plugin.
    builds.push(
      esbuild.build({
        entryPoints: [infileAbsolutePath],
        outfile: outfileAbsolutePath,
        bundle: true,
        minify: true,
        write: false,
        format: "iife",
        plugins: [bookmarkletPlugin],
      }),
    );
  }
}

// I don't think this should be necessary, and it doesn't seem to help the
// above-mentioned problem, but including it clarifies that, yes, even doing
// this does not solve the problem.
await Promise.all(builds);

// This, however, does seem to be required, at least in some form. The
// documentation isn't very clear about what to do in a situation like this when
// multiple asynchronous builds are kicked off.
//
// https://esbuild.github.io/getting-started/#deno
await esbuild.stop();
