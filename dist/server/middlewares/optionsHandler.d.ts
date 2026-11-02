import { Middleware } from "../serverTypes.js";
/**
 * OPTIONS request handler middleware
 * Automatically handles CORS preflight requests by returning 204 No Content
 * Sets standard CORS headers to allow cross-origin requests
 * @returns {Middleware} - OPTIONS handler middleware function
 */
export declare function optionsHandler(): Middleware;
