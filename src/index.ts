// Const
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
export const __projectRootDir = resolve(process.cwd())
export const __lyraRootDir = resolve(__dirname, "..")

// CLI System
export { Kernel } from "./cli/Kernel"
export * from "./cli/commands"
export * from "./cli/utils"

// Configuration
export * from "./config"

// Console
export * from "./console/LyraConsole"

// Errors & HTTP Status
export * from "./errors"

// loader
export * from "./loader"

// Mailer
export { mailer } from "./mailer"
export * from "./mailer/Mail"
export * from "./mailer/Transporter"

// Middlewares
export * from "./middlewares"

// ORM System
export * from "./orm"

// Security
export * from "./security"

// Server
export * from "./server"

// SSR (Server-Side Rendering)
export * from "./ssr"

// Types
export * from "./types"

// Validator
export * from "./validator"
