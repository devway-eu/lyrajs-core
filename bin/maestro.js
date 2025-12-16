#!/usr/bin/env node

import { register } from "node:module";
import { pathToFileURL } from "node:url";

// Register tsx for TypeScript support
register("tsx/esm", pathToFileURL("./"));

import { Kernel } from "../dist/cli/Kernel.js";

Kernel.run(process.argv);
