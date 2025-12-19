#!/usr/bin/env node

import childProcess from "node:child_process";
import url from "node:url";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import * as esbuild from "esbuild";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tmpDirPrefix = path.join(os.tmpdir(), "bookmarklets-");

const dirs = {
  src: path.join(__dirname, "../src"),
  bundles: fs.mkdtempSync(tmpDirPrefix),
  dist: path.join(__dirname, "../dist"),
};

fs.rmSync(dirs.dist, { recursive: true, force: true });
fs.mkdirSync(dirs.dist);

// Bundle the source files, so that a new file is created for each source file
// with all imported code included.
esbuild.buildSync({
  entryPoints: [path.join(dirs.src, "*.js")],
  outdir: dirs.bundles,
  bundle: true,
});

// Convert those bundled files to bookmarklets.
fs.readdirSync(dirs.bundles).forEach((bundledFilename) => {
  // Use the "bookmarklet" npm package to build all bookmarklets.
  //
  // bookmarklet also has a JavaScript API, but it's more verbose and perhaps a
  // bit more prone to changing than this CLI, so this is probably easier and
  // more future-proof.
  childProcess.execSync(
    `npx bookmarklet ${dirs.bundles}/${bundledFilename} ${dirs.dist}/${bundledFilename}`,
  );
});
