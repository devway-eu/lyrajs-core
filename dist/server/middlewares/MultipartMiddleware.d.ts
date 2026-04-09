/**
 * Middleware to handle multipart/form-data requests
 * Buffers and parses the data, then allows framework's body parser to work
 */
export declare const multipartMiddleware: (req: any, res: any, next: () => void) => Promise<void>;
