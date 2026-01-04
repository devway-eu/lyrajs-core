import * as path from "path"
import * as fs from "fs"

import { TemplateEngine } from "../TemplateEngine"

/**
 * EJS Template Engine Adapter
 * Provides EJS templating support for server-side rendering
 * Requires 'ejs' package to be installed
 */
export class EjsEngine implements TemplateEngine {
  private ejs: any

  constructor() {
    this.checkInstallation()
  }

  /**
   * Check if EJS is installed
   * Throws error if package is not found
   */
  private checkInstallation() {
    try {
      this.ejs = require("ejs")
    } catch (error) {
      throw new Error(
        'EJS is not installed. Please install it by running: npm install ejs'
      )
    }
  }

  getName(): string {
    return "ejs"
  }

  async render(template: string, data: object, templatePath: string, options?: any): Promise<string> {
    const fullTemplatePath = path.join(templatePath, template)

    // Check if template file exists
    if (!fs.existsSync(fullTemplatePath)) {
      throw new Error(`Template not found: ${fullTemplatePath}`)
    }

    // Read template file
    const templateContent = fs.readFileSync(fullTemplatePath, "utf-8")

    // Render template with EJS
    const html = this.ejs.render(templateContent, data, {
      filename: fullTemplatePath,
      ...options
    })

    return html
  }
}
