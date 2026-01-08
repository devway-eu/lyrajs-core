export interface SSRConfig {
    engine: "ejs" | "pug" | "handlebars" | "eta" | "zare" | "jsx";
    templates?: string;
    options?: any;
}
/**
 * TemplateRenderer Service (Singleton)
 * Manages template engine configuration and rendering
 * Provides a centralized service for server-side rendering
 */
export declare class TemplateRenderer {
    private static instance;
    private engine;
    private templatePath;
    private options;
    private constructor();
    /**
     * Get singleton instance of TemplateRenderer
     * @returns {TemplateRenderer} - Singleton instance
     */
    static getInstance(): TemplateRenderer;
    /**
     * Configure the template engine
     * @param {SSRConfig} config - SSR configuration
     * @throws {Error} - If engine is not supported or not installed
     */
    configure(config: SSRConfig): void;
    /**
     * Check if SSR is configured
     * @returns {boolean} - True if engine is configured
     */
    isConfigured(): boolean;
    /**
     * Render a template with data
     * @param {string} template - Template path (relative to templates directory)
     * @param {object} data - Data to pass to the template
     * @returns {Promise<string>} - Rendered HTML string
     * @throws {Error} - If SSR is not configured or template rendering fails
     */
    render(template: string, data: object): Promise<string>;
    /**
     * Get the current engine name
     * @returns {string | null} - Engine name or null if not configured
     */
    getEngineName(): string | null;
    /**
     * Get the templates path
     * @returns {string} - Absolute path to templates directory
     */
    getTemplatePath(): string;
}
