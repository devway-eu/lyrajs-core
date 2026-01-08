/**
 * Async Component Support for JSX Runtime
 * Handles async components that fetch data during rendering
 */
/**
 * Resolve a JSX element that may contain async components
 * Recursively resolves all promises in the component tree
 *
 * @param element - JSX element (string or Promise<string>)
 * @returns Promise<string> - Fully resolved HTML string
 */
export async function resolveAsync(element) {
    // If it's already a string, return it
    if (typeof element === 'string') {
        return element;
    }
    // If it's a Promise, await it and check if result needs further resolution
    if (element instanceof Promise) {
        const resolved = await element;
        return resolveAsync(resolved);
    }
    // If it's an array, resolve all elements
    if (Array.isArray(element)) {
        const resolved = await Promise.all(element.map((el) => resolveAsync(el)));
        return resolved.join('');
    }
    // Fallback - convert to string
    return String(element);
}
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
export function AsyncComponent(fn) {
    return async (props) => {
        const element = await fn(props);
        return resolveAsync(element);
    };
}
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
export async function ErrorBoundary({ children, fallback }) {
    try {
        return await resolveAsync(children);
    }
    catch (error) {
        console.error('ErrorBoundary caught error:', error);
        return resolveAsync(fallback);
    }
}
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
export async function renderParallel(components) {
    const resolved = await Promise.all(components.map((comp) => resolveAsync(comp)));
    return resolved.join('');
}
/**
 * Sequential component rendering
 * Renders async components one by one (useful when order matters)
 *
 * @param components - Array of JSX elements to render sequentially
 * @returns Promise<string> - All components rendered and joined
 */
export async function renderSequential(components) {
    const results = [];
    for (const component of components) {
        const resolved = await resolveAsync(component);
        results.push(resolved);
    }
    return results.join('');
}
//# sourceMappingURL=async.js.map