import * as path from "@std/path";

import * as esbuild from "esbuild";
import esbuildBookmarkletPlugin from "esbuildBookmarkletPlugin";

const dirname: string | undefined = import.meta.dirname;

if (dirname === undefined) {
  throw new Error("Cannot determine the name of the current directory.");
}

const projectRoot: string = path.dirname(dirname);

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
const builds: Promise<esbuild.BuildResult<esbuild.BuildOptions>>[] = [];

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

  if (entry.isDirectory) {
    continue;
  }

  const entryExtensionMatches: RegExpMatchArray = entry.name.match(
    /\.(?<extension>[^.]+)$/,
  );

  if (
    entryExtensionMatches === null ||
    entryExtensionMatches?.groups?.extension === undefined
  ) {
    throw new Error(
      `Cannot determine the extension of the file named "${entry.name}"`,
    );
  }

  const entryExtension = entryExtensionMatches.groups.extension;

  if (allowedExtensions.includes(entryExtension)) {
    const outfileBasename: string = entry.name.replace(/\.[^.]+$/, "") + ".js";

    const infileAbsolutePath: string = path.join(dirs.src, entry.name);
    const outfileAbsolutePath: string = path.join(dirs.dist, outfileBasename);

    // For some reason, somewhat rarely, some bookmarks are not successfully
    // written to the "dist" directory. It definitely seems like an async issue,
    // but I think this code is written correctly. I suppose it _could_ be an
    // esbuild issue or an issue with the plugin.
    //
    // Additionally, the bookmarklet plugin does not seem to correctly support
    // multiple entrypoints. If the loop is omitted, `entryPoints` is set to
    // an array of all source files, `outfile` is removed, and `outdir:
    // dirs.dist` is set, only the first bookmarklet is written. That seems like
    // it could be a bug in the plugin. I opened an issue about it:
    //
    // https://codeberg.org/reesericci/esbuild-plugin-bookmarklet/issues/1
    builds.push(
      esbuild.build({
        entryPoints: [infileAbsolutePath],
        outfile: outfileAbsolutePath,
        bundle: true,
        minify: true,
        write: false,
        format: "iife",
        plugins: [esbuildBookmarkletPlugin],
      }),
    );
  }
}

// This seems to be required, according to the esbuild documentation.
//
// https://esbuild.github.io/getting-started/#deno
await Promise.all(builds);
await esbuild.stop();
