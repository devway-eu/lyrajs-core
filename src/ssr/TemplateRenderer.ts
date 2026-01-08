import * as path from "path"

import { TemplateEngine } from "./TemplateEngine"
import { EjsEngine, EtaEngine, HandlebarsEngine, PugEngine, ZareEngine, JsxEngine } from "./engines"

export interface SSRConfig {
  engine: "ejs" | "pug" | "handlebars" | "eta" | "zare" | "jsx"
  templates?: string
  options?: any
}

/**
 * TemplateRenderer Service (Singleton)
 * Manages template engine configuration and rendering
 * Provides a centralized service for server-side rendering
 */
export class TemplateRenderer {
  private static instance: TemplateRenderer | null = null
  private engine: TemplateEngine | null = null
  private templatePath: string = ""
  private options: any = {}

  private constructor() {}

  /**
   * Get singleton instance of TemplateRenderer
   * @returns {TemplateRenderer} - Singleton instance
   */
  static getInstance(): TemplateRenderer {
    if (!TemplateRenderer.instance) {
      TemplateRenderer.instance = new TemplateRenderer()
    }
    return TemplateRenderer.instance
  }

  /**
   * Configure the template engine
   * @param {SSRConfig} config - SSR configuration
   * @throws {Error} - If engine is not supported or not installed
   */
  configure(config: SSRConfig): void {
    const { engine, templates = "./templates", options = {} } = config

    // Resolve templates path
    this.templatePath = path.resolve(process.cwd(), templates)
    this.options = options

    // Initialize the appropriate engine
    switch (engine) {
      case "ejs":
        this.engine = new EjsEngine()
        break
      case "pug":
        this.engine = new PugEngine()
        break
      case "handlebars":
        this.engine = new HandlebarsEngine()
        break
      case "eta":
        this.engine = new EtaEngine()
        break
      case "zare":
        this.engine = new ZareEngine()
        break
      case "jsx":
        this.engine = new JsxEngine(options)
        break
      default:
        throw new Error(
          `Unsupported template engine: ${engine}. Supported engines: ejs, pug, handlebars, eta, zare, jsx`
        )
    }
  }

  /**
   * Check if SSR is configured
   * @returns {boolean} - True if engine is configured
   */
  isConfigured(): boolean {
    return this.engine !== null
  }

  /**
   * Render a template with data
   * @param {string} template - Template path (relative to templates directory)
   * @param {object} data - Data to pass to the template
   * @returns {Promise<string>} - Rendered HTML string
   * @throws {Error} - If SSR is not configured or template rendering fails
   */
  async render(template: string, data: object): Promise<string> {
    if (!this.engine) {
      throw new Error(
        'SSR is not configured. Please configure SSR using app.setSetting("ssr", { engine: "ejs", templates: "./templates" })'
      )
    }

    return this.engine.render(template, data, this.templatePath, this.options)
  }

  /**
   * Get the current engine name
   * @returns {string | null} - Engine name or null if not configured
   */
  getEngineName(): string | null {
    return this.engine ? this.engine.getName() : null
  }

  /**
   * Get the templates path
   * @returns {string} - Absolute path to templates directory
   */
  getTemplatePath(): string {
    return this.templatePath
  }
}
