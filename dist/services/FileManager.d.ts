import { Service } from "../server/Service.js";
export interface UploadedFileInfo {
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimetype: string;
    extension: string;
}
export interface UploadOptions {
    maxFileSize?: number;
    allowedMimeTypes?: string[];
    allowedExtensions?: string[];
    preserveOriginalName?: boolean;
}
export declare class FileManager extends Service {
    private defaultMaxFileSize;
    /**
     * Gets the upload directory path
     */
    private getUploadDir;
    /**
     * Generates a unique filename to avoid conflicts
     */
    private generateUniqueFilename;
    /**
     * Validates file based on options
     */
    private validateFile;
    /**
     * Uploads a single file
     * @param file - File object from multipart request (e.g., from express-fileupload or multer)
     * @param options - Upload options for validation
     * @returns Information about the uploaded file
     */
    uploadFile(file: any, options?: UploadOptions): Promise<UploadedFileInfo>;
    /**
     * Uploads multiple files
     */
    uploadFiles(files: any[], options?: UploadOptions): Promise<UploadedFileInfo[]>;
    /**
     * Deletes a file from the upload directory
     */
    deleteFile(filename: string): Promise<void>;
    /**
     * Gets the full path of an uploaded file
     */
    getFilePath(filename: string): string;
    /**
     * Checks if a file exists
     */
    fileExists(filename: string): boolean;
}
