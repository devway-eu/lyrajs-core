import { Service } from "../server/Service.js";
import crypto from "crypto";
import * as fs from "fs";
import { createWriteStream } from "fs";
import * as path from "path";
import { pipeline } from "stream/promises";
export class FileManager extends Service {
    constructor() {
        super(...arguments);
        this.defaultMaxFileSize = 10 * 1024 * 1024; // 10MB
    }
    /**
     * Gets the upload directory path
     */
    getUploadDir() {
        const uploadDir = path.join(process.cwd(), "uploads");
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        return uploadDir;
    }
    /**
     * Generates a unique filename to avoid conflicts
     */
    generateUniqueFilename(originalName, preserveOriginal = false) {
        const ext = path.extname(originalName);
        const nameWithoutExt = path.basename(originalName, ext);
        if (preserveOriginal) {
            return originalName;
        }
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(8).toString("hex");
        // return `${nameWithoutExt.replace(/[&\/\\#,\-+()$~%.'":*?<>{}\u0020]/g,'_')}_${timestamp}_${randomString}${ext}`
        return `${crypto.createHash("md5").update(`${timestamp}_${randomString}`).digest("hex")}${ext}`;
    }
    /**
     * Validates file based on options
     */
    validateFile(file, options = {}) {
        const maxSize = options.maxFileSize || this.defaultMaxFileSize;
        // Check file size
        if (file.size > maxSize) {
            return {
                valid: false,
                error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`
            };
        }
        // Check mime type
        if (options.allowedMimeTypes && options.allowedMimeTypes.length > 0) {
            if (!options.allowedMimeTypes.includes(file.mimetype)) {
                return {
                    valid: false,
                    error: `File type ${file.mimetype} is not allowed`
                };
            }
        }
        // Check extension
        if (options.allowedExtensions && options.allowedExtensions.length > 0) {
            const ext = path.extname(file.name).toLowerCase().substring(1);
            if (!options.allowedExtensions.includes(ext)) {
                return {
                    valid: false,
                    error: `File extension .${ext} is not allowed`
                };
            }
        }
        return { valid: true };
    }
    /**
     * Uploads a single file
     * @param file - File object from multipart request (e.g., from express-fileupload or multer)
     * @param options - Upload options for validation
     * @returns Information about the uploaded file
     */
    async uploadFile(file, options = {}) {
        // Validate file
        const validation = this.validateFile(file, options);
        if (!validation.valid) {
            throw new Error(validation.error);
        }
        const filename = this.generateUniqueFilename(file.name || file.originalname, options.preserveOriginalName);
        const uploadDir = this.getUploadDir();
        const filePath = path.join(uploadDir, filename);
        // Handle different file upload middleware formats
        if (file.mv) {
            // express-fileupload
            await file.mv(filePath);
        }
        else if (file.data) {
            // Buffer-based upload
            await fs.promises.writeFile(filePath, file.data);
        }
        else if (file.path) {
            // Multer or similar (temporary file)
            await fs.promises.copyFile(file.path, filePath);
            // Clean up temp file
            await fs.promises.unlink(file.path);
        }
        else if (file.stream) {
            // Stream-based upload
            const writeStream = createWriteStream(filePath);
            await pipeline(file.stream, writeStream);
        }
        else {
            throw new Error("Unsupported file upload format");
        }
        const stats = await fs.promises.stat(filePath);
        return {
            filename,
            originalName: file.name || file.originalname,
            path: filePath,
            size: stats.size,
            mimetype: file.mimetype || file.type,
            extension: path.extname(filename).substring(1)
        };
    }
    /**
     * Uploads multiple files
     */
    async uploadFiles(files, options = {}) {
        const uploadPromises = files.map((file) => this.uploadFile(file, options));
        return Promise.all(uploadPromises);
    }
    /**
     * Deletes a file from the upload directory
     */
    async deleteFile(filename) {
        const uploadDir = this.getUploadDir();
        const filePath = path.join(uploadDir, filename);
        if (!fs.existsSync(filePath)) {
            throw new Error("File not found");
        }
        await fs.promises.unlink(filePath);
    }
    /**
     * Gets the full path of an uploaded file
     */
    getFilePath(filename) {
        return path.join(this.getUploadDir(), filename);
    }
    /**
     * Checks if a file exists
     */
    fileExists(filename) {
        const uploadDir = this.getUploadDir();
        const filePath = path.join(uploadDir, filename);
        return fs.existsSync(filePath);
    }
}
//# sourceMappingURL=FileManager.js.map