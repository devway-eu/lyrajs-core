import { TemplateEngine } from "../TemplateEngine.js";
/**
 * Zare Template Engine Adapter
 * Provides Zare templating support for server-side rendering
 * Requires 'zare' package to be installed
 */
export declare class ZareEngine implements TemplateEngine {
    private zare;
    constructor();
    /**
     * Check if Zare is installed
     * Throws error if package is not found
     */
    private checkInstallation;
    getName(): string;
    render(template: string, data: object, templatePath: string, options?: any): Promise<string>;
}
