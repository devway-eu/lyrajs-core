import { CorsOptions, Middleware } from '../serverTypes.js';
/**
 * CORS middleware factory that creates middleware with specified CORS configuration
 * @param {CorsOptions} [options={}] - CORS configuration options
 * @returns {Middleware} - Configured CORS middleware function
 */
export declare function cors(options?: CorsOptions): Middleware;
