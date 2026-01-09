import * as path from "path";
import * as fs from "fs";
/**
 * Pug Template Engine Adapter
 * Provides Pug templating support for server-side rendering
 * Requires 'pug' package to be installed
 */
export class PugEngine {
    constructor() {
        this.checkInstallation();
    }
    /**
     * Check if Pug is installed
     * Throws error if package is not found
     */
    checkInstallation() {
        try {
            this.pug = require("pug");
        }
        catch (error) {
            throw new Error('Pug is not installed. Please install it by running: npm install pug');
        }
    }
    getName() {
        return "pug";
    }
    async render(template, data, templatePath, options) {
        const fullTemplatePath = path.join(templatePath, template);
        // Check if template file exists
        if (!fs.existsSync(fullTemplatePath)) {
            throw new Error(`Template not found: ${fullTemplatePath}`);
        }
        // Compile and render template with Pug
        const html = this.pug.renderFile(fullTemplatePath, {
            ...data,
            basedir: templatePath,
            ...options
        });
        return html;
    }
}
//# sourceMappingURL=PugEngine.js.map