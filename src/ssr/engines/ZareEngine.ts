import * as path from "path"
import * as fs from "fs"

import { TemplateEngine } from "../TemplateEngine"

/**
 * Zare Template Engine Adapter
 * Provides Zare templating support for server-side rendering
 * Requires 'zare' package to be installed
 */
export class ZareEngine implements TemplateEngine {
  private zare: any

  constructor() {
    this.checkInstallation()
  }

  /**
   * Check if Zare is installed
   * Throws error if package is not found
   */
  private checkInstallation() {
    try {
      this.zare = require("zare")
    } catch (error) {
      throw new Error(
        'Zare is not installed. Please install it by running: npm install zare'
      )
    }
  }

  getName(): string {
    return "zare"
  }

  async render(template: string, data: object, templatePath: string, options?: any): Promise<string> {
    const fullTemplatePath = path.join(templatePath, template)

    // Check if template file exists
    if (!fs.existsSync(fullTemplatePath)) {
      throw new Error(`Template not found: ${fullTemplatePath}`)
    }

    // Read template file
    const templateContent = fs.readFileSync(fullTemplatePath, "utf-8")

    // Render template with Zare
    const html = this.zare.render(templateContent, data, options)

    return html
  }
}
