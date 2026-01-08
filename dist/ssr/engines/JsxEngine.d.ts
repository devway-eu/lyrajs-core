/**
 * JSX/TSX Template Engine for LyraJS
 * Implements the TemplateEngine interface for JSX/TSX rendering
 */
import { TemplateEngine } from '../TemplateEngine.js';
import { CompilerOptions } from './jsx/compiler.js';
/**
 * JSX Engine Options
 */
export interface JsxEngineOptions extends CompilerOptions {
    /**
     * Default file extension when no extension is provided
     * @default '.tsx'
     */
    defaultExtension?: '.jsx' | '.tsx';
}
/**
 * JSX/TSX Template Engine
 * Supports both .jsx and .tsx files with full component composition and async rendering
 *
 * Features:
 * - Runtime compilation with esbuild
 * - Memory and file-based caching
 * - Async component support (data fetching)
 * - Component composition
 * - TypeScript type checking
 * - Auto-import of JSX runtime (h, Fragment)
 * - node_modules import support
 *
 * @example
 * // Server setup
 * app.setSetting('ssr', {
 *   engine: 'jsx',
 *   templates: './views',
 *   options: {
 *     cache: true,
 *     fileCache: true
 *   }
 * })
 *
 * // Controller
 * await this.render('home.tsx', { name: 'World' })
 *
 * // Template (views/home.tsx)
 * export default function Home({ name }) {
 *   return <h1>Hello {name}</h1>
 * }
 */
export declare class JsxEngine implements TemplateEngine {
    private compiler;
    private options;
    constructor(options?: JsxEngineOptions);
    /**
     * Get engine name
     */
    getName(): string;
    /**
     * Resolve template file path with extension
     * Supports both .jsx and .tsx files
     */
    private resolveTemplatePath;
    /**
     * Render a JSX/TSX template
     *
     * @param template - Template file path (relative to templates directory)
     * @param data - Data to pass to the template component
     * @param templatePath - Absolute path to templates directory
     * @param options - Additional rendering options
     * @returns Promise<string> - Rendered HTML string
     */
    render(template: string, data: object, templatePath: string, options?: any): Promise<string>;
    /**
     * Clear all caches (useful for development)
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        memoryCacheSize: number;
        fileCacheSize: number;
        cachedFiles: string[];
    };
}
