#!/usr/bin/env node
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the Kernel
const kernelPath = join(__dirname, "../dist/cli/Kernel.js");

// Try to find tsx in the user's project
const tsxCommand = process.platform === "win32" ? "tsx.cmd" : "tsx";

const child = spawn(tsxCommand, [kernelPath, ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: true,
  cwd: process.cwd()
});

child.on("error", (error) => {
  console.error("Failed to start maestro:", error.message);
  console.error("Make sure tsx is installed: npm install tsx");
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
