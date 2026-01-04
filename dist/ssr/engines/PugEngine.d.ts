import { TemplateEngine } from "../TemplateEngine.js";
/**
 * Pug Template Engine Adapter
 * Provides Pug templating support for server-side rendering
 * Requires 'pug' package to be installed
 */
export declare class PugEngine implements TemplateEngine {
    private pug;
    constructor();
    /**
     * Check if Pug is installed
     * Throws error if package is not found
     */
    private checkInstallation;
    getName(): string;
    render(template: string, data: object, templatePath: string, options?: any): Promise<string>;
}
