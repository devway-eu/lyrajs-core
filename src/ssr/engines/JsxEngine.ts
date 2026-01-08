/**
 * JSX/TSX Template Engine for LyraJS
 * Implements the TemplateEngine interface for JSX/TSX rendering
 */

import * as fs from 'fs'
import * as path from 'path'
import { TemplateEngine } from '../TemplateEngine'
import { TsxCompiler, CompilerOptions } from './jsx/compiler'
import { resolveAsync } from './jsx/async'

/**
 * JSX Engine Options
 */
export interface JsxEngineOptions extends CompilerOptions {
  /**
   * Default file extension when no extension is provided
   * @default '.tsx'
   */
  defaultExtension?: '.jsx' | '.tsx'
}

/**
 * JSX/TSX Template Engine
 * Supports both .jsx and .tsx files with full component composition and async rendering
 *
 * Features:
 * - Runtime compilation with esbuild
 * - Memory and file-based caching
 * - Async component support (data fetching)
 * - Component composition
 * - TypeScript type checking
 * - Auto-import of JSX runtime (h, Fragment)
 * - node_modules import support
 *
 * @example
 * // Server setup
 * app.setSetting('ssr', {
 *   engine: 'jsx',
 *   templates: './views',
 *   options: {
 *     cache: true,
 *     fileCache: true
 *   }
 * })
 *
 * // Controller
 * await this.render('home.tsx', { name: 'World' })
 *
 * // Template (views/home.tsx)
 * export default function Home({ name }) {
 *   return <h1>Hello {name}</h1>
 * }
 */
export class JsxEngine implements TemplateEngine {
  private compiler: TsxCompiler
  private options: JsxEngineOptions

  constructor(options: JsxEngineOptions = {}) {
    this.options = {
      cache: options.cache ?? true,
      fileCache: options.fileCache ?? false,
      cacheDir: options.cacheDir,
      verbose: options.verbose ?? process.env.NODE_ENV !== 'production',
      defaultExtension: options.defaultExtension ?? '.tsx'
    }

    this.compiler = new TsxCompiler({
      cache: this.options.cache,
      fileCache: this.options.fileCache,
      cacheDir: this.options.cacheDir,
      verbose: this.options.verbose
    })
  }

  /**
   * Get engine name
   */
  getName(): string {
    return 'jsx'
  }

  /**
   * Resolve template file path with extension
   * Supports both .jsx and .tsx files
   */
  private resolveTemplatePath(template: string, templatePath: string): string {
    const basePath = path.join(templatePath, template)

    // If template already has an extension, use it directly
    if (path.extname(template)) {
      if (fs.existsSync(basePath)) {
        return basePath
      }
      throw new Error(`Template not found: ${basePath}`)
    }

    // Try with .tsx first (default)
    const tsxPath = basePath + '.tsx'
    if (fs.existsSync(tsxPath)) {
      return tsxPath
    }

    // Try with .jsx
    const jsxPath = basePath + '.jsx'
    if (fs.existsSync(jsxPath)) {
      return jsxPath
    }

    // Try with .ts
    const tsPath = basePath + '.ts'
    if (fs.existsSync(tsPath)) {
      return tsPath
    }

    // Try with .js
    const jsPath = basePath + '.js'
    if (fs.existsSync(jsPath)) {
      return jsPath
    }

    throw new Error(
      `Template not found: ${template}\n` +
      `Searched for: ${tsxPath}, ${jsxPath}, ${tsPath}, ${jsPath}`
    )
  }

  /**
   * Render a JSX/TSX template
   *
   * @param template - Template file path (relative to templates directory)
   * @param data - Data to pass to the template component
   * @param templatePath - Absolute path to templates directory
   * @param options - Additional rendering options
   * @returns Promise<string> - Rendered HTML string
   */
  async render(
    template: string,
    data: object,
    templatePath: string,
    options?: any
  ): Promise<string> {
    try {
      // Resolve full template path
      const fullTemplatePath = this.resolveTemplatePath(template, templatePath)

      // Compile the template
      const templateModule = this.compiler.compile(fullTemplatePath)

      // Get the default export (component function)
      const Component = templateModule.default || templateModule

      if (typeof Component !== 'function') {
        throw new Error(
          `Template ${template} must export a default function component.\n` +
          `Example:\n` +
          `  export default function MyTemplate(props) {\n` +
          `    return <div>Hello {props.name}</div>\n` +
          `  }`
        )
      }

      // Render the component with data
      const result = Component(data)

      // Resolve async components if any
      const html = await resolveAsync(result)

      return html
    } catch (error: any) {
      // Enhanced error reporting
      if (this.options.verbose) {
        console.error(`\n[JsxEngine] Rendering error:`)
        console.error(`  Template: ${template}`)
        console.error(`  Path: ${templatePath}`)
        console.error(`  Error: ${error.message}`)
        if (error.stack) {
          console.error(`\nStack trace:`)
          console.error(error.stack)
        }
      }

      throw new Error(`Template rendering failed for ${template}: ${error.message}`)
    }
  }

  /**
   * Clear all caches (useful for development)
   */
  clearCache(): void {
    this.compiler.clearCache()
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.compiler.getCacheStats()
  }
}
