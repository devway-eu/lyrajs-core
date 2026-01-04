import * as path from "path";
import * as fs from "fs";
/**
 * Handlebars Template Engine Adapter
 * Provides Handlebars templating support for server-side rendering
 * Requires 'handlebars' package to be installed
 */
export class HandlebarsEngine {
    handlebars;
    constructor() {
        this.checkInstallation();
    }
    /**
     * Check if Handlebars is installed
     * Throws error if package is not found
     */
    checkInstallation() {
        try {
            this.handlebars = require("handlebars");
        }
        catch (error) {
            throw new Error('Handlebars is not installed. Please install it by running: npm install handlebars');
        }
    }
    getName() {
        return "handlebars";
    }
    async render(template, data, templatePath, options) {
        const fullTemplatePath = path.join(templatePath, template);
        // Check if template file exists
        if (!fs.existsSync(fullTemplatePath)) {
            throw new Error(`Template not found: ${fullTemplatePath}`);
        }
        // Read template file
        const templateContent = fs.readFileSync(fullTemplatePath, "utf-8");
        // Compile template
        const compiledTemplate = this.handlebars.compile(templateContent, options);
        // Render template with data
        const html = compiledTemplate(data);
        return html;
    }
}
//# sourceMappingURL=HandlebarsEngine.js.map