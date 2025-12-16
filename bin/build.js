#!/usr/bin/env node

import childProcess from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirs = {
  src: path.join(__dirname, "../src"),
  dist: path.join(__dirname, "../dist"),
};

fs.rmSync(dirs.dist, { recursive: true, force: true });
fs.mkdirSync(dirs.dist);

const sourceFiles = fs
  .readdirSync(dirs.src, { withFileTypes: true })
  .filter((node) => !node.isDirectory());

sourceFiles.forEach((file) => {
  // Use the "bookmarklet" npm package to build all bookmarklets.
  //
  // bookmarklet also has a JavaScript API, but it's more verbose and perhaps a
  // bit more prone to changing than this CLI, so this is probably easier and
  // more future-proof.
  childProcess.execSync(
    `npx bookmarklet ${dirs.src}/${file.name} ${dirs.dist}/${file.name}`,
  );
});
