import * as path from "path";
import * as fs from "fs";
/**
 * Eta Template Engine Adapter
 * Provides Eta templating support for server-side rendering
 * Requires 'eta' package to be installed
 */
export class EtaEngine {
    eta;
    constructor() {
        this.checkInstallation();
    }
    /**
     * Check if Eta is installed
     * Throws error if package is not found
     */
    checkInstallation() {
        try {
            this.eta = require("eta");
        }
        catch (error) {
            throw new Error('Eta is not installed. Please install it by running: npm install eta');
        }
    }
    getName() {
        return "eta";
    }
    async render(template, data, templatePath, options) {
        const fullTemplatePath = path.join(templatePath, template);
        // Check if template file exists
        if (!fs.existsSync(fullTemplatePath)) {
            throw new Error(`Template not found: ${fullTemplatePath}`);
        }
        // Read template file
        const templateContent = fs.readFileSync(fullTemplatePath, "utf-8");
        // Render template with Eta
        const html = this.eta.render(templateContent, data, {
            views: templatePath,
            ...options
        });
        return html;
    }
}
//# sourceMappingURL=EtaEngine.js.map