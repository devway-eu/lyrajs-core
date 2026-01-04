/**
 * TemplateEngine interface
 * Defines the contract for all template engine adapters
 * Each engine must implement the render method to compile and render templates
 */
export interface TemplateEngine {
    /**
     * Render a template with the provided data
     * @param {string} template - Path to the template file (relative to templates directory)
     * @param {object} data - Data to pass to the template
     * @param {string} templatePath - Absolute path to the templates directory
     * @param {any} options - Engine-specific options
     * @returns {Promise<string>} - Rendered HTML string
     */
    render(template: string, data: object, templatePath: string, options?: any): Promise<string>;
    /**
     * Get the name of the template engine
     * @returns {string} - Engine name (e.g., 'ejs', 'pug', 'handlebars')
     */
    getName(): string;
}
