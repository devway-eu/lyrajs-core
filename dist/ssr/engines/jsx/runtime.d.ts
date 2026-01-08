/**
 * JSX Runtime for LyraJS
 * Provides core h() function, Fragment support, and HTML rendering
 */
/**
 * JSX Element type - can be a string (HTML), Promise<string> for async components, or array of elements
 */
export type JSXElement = string | Promise<string> | JSXElement[];
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
 * Render props/attributes to HTML string
 */
export declare function renderProps(props: Props | null): string;
/**
 * Core JSX factory function
 * Creates HTML elements from JSX syntax
 *
 * @param tag - HTML tag name or Component function
 * @param props - Element properties/attributes
 * @param children - Child elements
 * @returns HTML string or Promise<string> for async components
 */
export declare function h(tag: string | Component | symbol, props: Props | null, ...children: any[]): JSXElement;
/**
 * JSX factory for TypeScript (alternative name)
 */
export declare const jsx: typeof h;
export declare const jsxs: typeof h;
export declare const jsxDEV: typeof h;
