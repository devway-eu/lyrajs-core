import { TemplateEngine } from "../TemplateEngine.js";
/**
 * Eta Template Engine Adapter
 * Provides Eta templating support for server-side rendering
 * Requires 'eta' package to be installed
 */
export declare class EtaEngine implements TemplateEngine {
    private eta;
    constructor();
    /**
     * Check if Eta is installed
     * Throws error if package is not found
     */
    private checkInstallation;
    getName(): string;
    render(template: string, data: object, templatePath: string, options?: any): Promise<string>;
}
