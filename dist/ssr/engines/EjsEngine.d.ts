import { TemplateEngine } from "../TemplateEngine.js";
/**
 * EJS Template Engine Adapter
 * Provides EJS templating support for server-side rendering
 * Requires 'ejs' package to be installed
 */
export declare class EjsEngine implements TemplateEngine {
    private ejs;
    constructor();
    /**
     * Check if EJS is installed
     * Throws error if package is not found
     */
    private checkInstallation;
    getName(): string;
    render(template: string, data: object, templatePath: string, options?: any): Promise<string>;
}
