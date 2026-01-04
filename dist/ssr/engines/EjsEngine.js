import * as path from "path";
import * as fs from "fs";
/**
 * EJS Template Engine Adapter
 * Provides EJS templating support for server-side rendering
 * Requires 'ejs' package to be installed
 */
export class EjsEngine {
    ejs;
    constructor() {
        this.checkInstallation();
    }
    /**
     * Check if EJS is installed
     * Throws error if package is not found
     */
    checkInstallation() {
        try {
            this.ejs = require("ejs");
        }
        catch (error) {
            throw new Error('EJS is not installed. Please install it by running: npm install ejs');
        }
    }
    getName() {
        return "ejs";
    }
    async render(template, data, templatePath, options) {
        const fullTemplatePath = path.join(templatePath, template);
        // Check if template file exists
        if (!fs.existsSync(fullTemplatePath)) {
            throw new Error(`Template not found: ${fullTemplatePath}`);
        }
        // Read template file
        const templateContent = fs.readFileSync(fullTemplatePath, "utf-8");
        // Render template with EJS
        const html = this.ejs.render(templateContent, data, {
            filename: fullTemplatePath,
            ...options
        });
        return html;
    }
}
//# sourceMappingURL=EjsEngine.js.map