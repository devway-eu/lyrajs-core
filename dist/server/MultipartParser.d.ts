import { Service } from "../server/Service.js";
export interface ParsedMultipartData {
    fields: Record<string, string>;
    files: Array<{
        fieldname: string;
        name: string;
        data: Buffer;
        mimetype: string;
        size: number;
    }>;
}
export declare class MultipartParser extends Service {
    /**
     * Parses multipart/form-data from a request
     * @param req - The request object (must have headers and body when using parserType: 'raw')
     * @returns Parsed fields and files
     */
    parse(req: any): Promise<ParsedMultipartData>;
}
