import * as path from "jsr:@std/path@1.1.4";

import * as esbuild from "https://deno.land/x/esbuild@v0.27.2/mod.js";
import bookmarkletPlugin from "https://deno.land/x/esbuild_plugin_bookmarklet@v1.0.0/mod.js";

const projectRoot = path.dirname(path.dirname(import.meta.filename));

const dirs = {
  src: path.join(projectRoot, "src"),
  bundles: await Deno.makeTempDir({ prefix: "bookmarklets-" }),
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
}
await Deno.mkdir(dirs.dist);

const sourceFiles = [];
for await (const node of Deno.readDir(dirs.src)) {
  if (node.isFile && node.name.endsWith("ts")) {
    sourceFiles.push(path.join(dirs.src, node.name));
  }
}

if (sourceFiles.length === 0) {
  throw new Error("No source files found.");
}

// Bundle each source file into a new file with all imported code included.
await esbuild.build({
  entryPoints: sourceFiles,
  outdir: dirs.bundles,
  bundle: true,
});

// Convert those bundled files to bookmarklets using esbuild and the
// "bookmarklet" plugin for esbuild.
for await (const bundledFile of Deno.readDir(dirs.bundles)) {
  esbuild.build({
    entryPoints: [path.join(dirs.bundles, bundledFile.name)],
    bundle: true,
    minify: true,
    outfile: path.join(dirs.dist, bundledFile.name),
    write: false,
    format: "iife",
    plugins: [bookmarkletPlugin],
  });
}
