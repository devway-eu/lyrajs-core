#!/usr/bin/env node

/**
 * LyraJS CLI entry point
 * Bootstraps the CLI kernel and processes command-line arguments
 */

import { Kernel } from "./Kernel"

Kernel.run(process.argv)
