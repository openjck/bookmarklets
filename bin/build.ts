import * as path from "jsr:@std/path@1.1.4";

import * as esbuild from "https://deno.land/x/esbuild@v0.27.2/mod.js";
import bookmarkletPlugin from "https://deno.land/x/esbuild_plugin_bookmarklet@v1.0.0/mod.js";

const projectRoot: string = path.dirname(import.meta.dirname);

const dirs: Record<string, string> = {
  src: path.join(projectRoot, "src"),
  dist: path.join(projectRoot, "dist"),
};

// Recreate the "dist" directory from scratch.
try {
  await Deno.remove(dirs.dist, { recursive: true });
} catch (err) {
  if (err instanceof Deno.errors.NotFound) {
    // The dist directory did not exist during the attempt to remove it. This
    // can safely be ignored.
  } else {
    throw err;
  }
} finally {
  await Deno.mkdir(dirs.dist);
}

const sourceFiles: string[] = [];
const allowedExtensions: string[] = ["js", "ts"];

for await (const node of Deno.readDir(dirs.src)) {
  const extension = node.name.split(".").pop();
  if (node.isFile && allowedExtensions.includes(extension)) {
    sourceFiles.push(path.join(dirs.src, node.name));
  }
}

if (sourceFiles.length === 0) {
  throw new Error("No source files found.");
}

// For some reason, somewhat rarely, some bookmarks are not successfully written
// to the "dist" directory. It definitely seems like an async issue, but my
// attempts to fix it have not succeeded. I may need to revisit it sometime with
// a fresh set of eyes.
//
// Additionally, the bookmarklet plugin does not seem to correctly support
// multiple entrypoints. If the loop is omitted, `entryPoints` is set to
// `sourceFiles`, `outfile` is removed, and `outdir: dirs.dist` is set, only the
// first bookmarklet is written. That seems like it could be a bug in the
// plugin.
sourceFiles.forEach((sourceFile) => {
  const outFilename = path.basename(sourceFile).replace(/\..+$/, ".js");

  esbuild.build({
    entryPoints: [sourceFile],
    outfile: path.join(dirs.dist, outFilename),
    bundle: true,
    minify: true,
    write: false,
    format: "iife",
    plugins: [bookmarkletPlugin],
  });

  esbuild.stop();
});
