import { CorsOptions, Middleware, Request, Response, NextFunction } from '../serverTypes';

/**
 * CORS middleware factory that creates middleware with specified CORS configuration
 * @param {CorsOptions} [options={}] - CORS configuration options
 * @returns {Middleware} - Configured CORS middleware function
 */
export function cors(options: CorsOptions = {}): Middleware {
    return (req: Request, res: Response, next: NextFunction) => {
        res.setHeader('Access-Control-Allow-Origin', options.origin || '*');
        res.setHeader('Access-Control-Allow-Methods', options.methods || 'GET, POST, PUT, DELETE, PATCH');
        res.setHeader('Access-Control-Allow-Headers', options.headers || 'Content-Type, Authorization');

        if (options.credentials) {
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        }

        if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
        }

        next();
    };
}