import { Service } from "../server/Service.js";
export class MultipartParser extends Service {
    /**
     * Parses multipart/form-data from a request
     * @param req - The request object (must have headers and body when using parserType: 'raw')
     * @returns Parsed fields and files
     */
    async parse(req) {
        // Check if multipart data was already parsed by middleware
        if (req.multipartData) {
            return Promise.resolve(req.multipartData);
        }
        // Fallback: try to parse directly (will fail if stream already consumed)
        throw new Error("Multipart data not found. Make sure multipartMiddleware is registered in server.ts");
    }
}
//# sourceMappingURL=MultipartParser.js.map