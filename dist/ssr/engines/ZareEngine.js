import * as path from "path";
import * as fs from "fs";
/**
 * Zare Template Engine Adapter
 * Provides Zare templating support for server-side rendering
 * Requires 'zare' package to be installed
 */
export class ZareEngine {
    zare;
    constructor() {
        this.checkInstallation();
    }
    /**
     * Check if Zare is installed
     * Throws error if package is not found
     */
    checkInstallation() {
        try {
            this.zare = require("zare");
        }
        catch (error) {
            throw new Error('Zare is not installed. Please install it by running: npm install zare');
        }
    }
    getName() {
        return "zare";
    }
    async render(template, data, templatePath, options) {
        const fullTemplatePath = path.join(templatePath, template);
        // Check if template file exists
        if (!fs.existsSync(fullTemplatePath)) {
            throw new Error(`Template not found: ${fullTemplatePath}`);
        }
        // Read template file
        const templateContent = fs.readFileSync(fullTemplatePath, "utf-8");
        // Render template with Zare
        const html = this.zare.render(templateContent, data, options);
        return html;
    }
}
//# sourceMappingURL=ZareEngine.js.map