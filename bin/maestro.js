#!/usr/bin/env node

import { register } from 'tsx/esm/api'

// Register tsx to handle TypeScript imports globally
register()

try {
  const { Kernel } = await import('../dist/cli/Kernel.js')
  await Kernel.run(process.argv)
} catch (error) {
  console.error("Failed to run maestro:", error.message);
  process.exit(1);
}
