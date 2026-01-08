/**
 * Async Component Support for JSX Runtime
 * Handles async components that fetch data during rendering
 */
import { JSXElement } from './runtime.js';
/**
 * Resolve a JSX element that may contain async components
 * Recursively resolves all promises in the component tree
 *
 * @param element - JSX element (string or Promise<string>)
 * @returns Promise<string> - Fully resolved HTML string
 */
export declare function resolveAsync(element: JSXElement): Promise<string>;
/**
 * Create an async component wrapper
 * Useful for explicitly marking components as async
 *
 * @param fn - Async component function
 * @returns Component that returns a Promise
 *
 * @example
 * const UserData = AsyncComponent(async ({ userId }) => {
 *   const user = await fetchUser(userId)
 *   return <div>{user.name}</div>
 * })
 */
export declare function AsyncComponent<P = any>(fn: (props: P) => Promise<JSXElement>): (props: P) => Promise<string>;
/**
 * Suspense-like boundary for error handling in async components
 * Catches errors in async component rendering and shows fallback
 *
 * @param props - Contains children and fallback
 * @returns Rendered children or fallback on error
 *
 * @example
 * <ErrorBoundary fallback={<div>Loading failed</div>}>
 *   <AsyncUserData userId={123} />
 * </ErrorBoundary>
 */
export declare function ErrorBoundary({ children, fallback }: {
    children: JSXElement;
    fallback: JSXElement;
}): Promise<string>;
/**
 * Parallel component rendering
 * Renders multiple async components in parallel for better performance
 *
 * @param components - Array of JSX elements to render in parallel
 * @returns Promise<string> - All components rendered and joined
 *
 * @example
 * const html = await renderParallel([
 *   <UserProfile userId={1} />,
 *   <UserPosts userId={1} />,
 *   <UserComments userId={1} />
 * ])
 */
export declare function renderParallel(components: JSXElement[]): Promise<string>;
/**
 * Sequential component rendering
 * Renders async components one by one (useful when order matters)
 *
 * @param components - Array of JSX elements to render sequentially
 * @returns Promise<string> - All components rendered and joined
 */
export declare function renderSequential(components: JSXElement[]): Promise<string>;
