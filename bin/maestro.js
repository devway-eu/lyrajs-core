#!/usr/bin/env node
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use tsx to run the Kernel with TypeScript support
const tsxPath = join(__dirname, "../node_modules/.bin/tsx");
const kernelPath = join(__dirname, "../dist/cli/Kernel.js");

const child = spawn(process.platform === "win32" ? "tsx.cmd" : "tsx", [kernelPath, ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
