import * as path from "@std/path";
import { walk, WalkEntry } from "@std/fs/walk";

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

const entryPointWalkEntries: WalkEntry[] = await Array.fromAsync(
  walk("src", { exts: allowedExtensions, maxDepth: 1 }),
);

const entryPoints: string[] = entryPointWalkEntries.map((entry) => entry.path);

await esbuild.build({
  entryPoints,
  outdir: dirs.dist,
  bundle: true,
  minify: true,
  write: false,
  format: "iife",
  plugins: [esbuildBookmarkletPlugin],
});

// This seems to be required, according to the esbuild documentation.
//
// https://esbuild.github.io/getting-started/#deno
await esbuild.stop();
