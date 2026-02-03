/**
 * JSX Runtime for LyraJS
 * Provides core h() function, Fragment support, and HTML rendering
 */
/**
 * JSX Element type - can be a string (HTML), Promise<string> for async components, or array of elements
 */
export type JSXElement = string | SafeHTML | Promise<string | SafeHTML> | JSXElement[];
/**
 * Fragment symbol for grouping elements without a wrapper
 */
export declare const Fragment: unique symbol;
/**
 * Props type - any object with string keys
 */
export interface Props {
    [key: string]: any;
}
/**
 * Component function type - can be sync or async
 */
export type Component<P = Props> = (props: P) => JSXElement | JSXElement[];
/**
 * Escape HTML special characters to prevent XSS attacks
 */
export declare function escape(text: any): string;
/**
 * Global brand symbol for SafeHTML.
 * Uses Symbol.for so it is shared across module boundaries
 * (inlined runtime in compiled templates vs. package import).
 */
export declare const SAFE_HTML_BRAND: unique symbol;
/**
 * Wrapper that marks a string as already-escaped HTML.
 * h() returns SafeHTML for every rendered element; plain strings
 * passed as {expression} children are escaped automatically.
 * Use rawHtml() when you intentionally need to bypass escaping.
 */
export declare class SafeHTML {
    readonly html: string;
    constructor(html: string);
    toString(): string;
}
/**
 * Check whether a value is a SafeHTML instance.
 * Works across module boundaries because it checks the shared symbol brand.
 */
export declare function isSafeHTML(value: any): value is SafeHTML;
/**
 * Mark a string as trusted HTML that should NOT be escaped.
 * Only use with content you fully trust (e.g. output from a
 * sanitization library, or static markup you control).
 *
 * @example
 *   <div>{rawHtml(sanitizedContent)}</div>
 */
export declare function rawHtml(html: string): SafeHTML;
/**
 * Render props/attributes to HTML string
 */
export declare function renderProps(props: Props | null): string;
/**
 * Core JSX factory function
 * Creates HTML elements from JSX syntax.
 * All string children are HTML-escaped automatically.
 * Use rawHtml() to opt a specific value out of escaping, or
 * dangerouslySetInnerHTML={{ __html }} as a React-compatible alternative.
 *
 * @param tag - HTML tag name or Component function
 * @param props - Element properties/attributes
 * @param children - Child elements
 * @returns SafeHTML or Promise<SafeHTML> for async components
 */
export declare function h(tag: string | Component | symbol, props: Props | null, ...children: any[]): JSXElement;
/**
 * JSX factory for TypeScript (alternative name)
 */
export declare const jsx: typeof h;
export declare const jsxs: typeof h;
export declare const jsxDEV: typeof h;
