import { TemplateEngine } from "../TemplateEngine.js";
/**
 * Handlebars Template Engine Adapter
 * Provides Handlebars templating support for server-side rendering
 * Requires 'handlebars' package to be installed
 */
export declare class HandlebarsEngine implements TemplateEngine {
    private handlebars;
    constructor();
    /**
     * Check if Handlebars is installed
     * Throws error if package is not found
     */
    private checkInstallation;
    getName(): string;
    render(template: string, data: object, templatePath: string, options?: any): Promise<string>;
}
