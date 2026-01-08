/**
 * TSX/JSX Runtime Compiler for LyraJS
 * Uses esbuild to compile TypeScript/JSX at runtime with caching
 */
/**
 * Compiler options
 */
export interface CompilerOptions {
    /**
     * Enable memory caching (default: true)
     */
    cache?: boolean;
    /**
     * Enable file system cache for production (default: false)
     */
    fileCache?: boolean;
    /**
     * Cache directory for file-based caching
     */
    cacheDir?: string;
    /**
     * Show compilation errors in detail (default: true in dev)
     */
    verbose?: boolean;
}
/**
 * TSX/JSX Runtime Compiler
 * Compiles and caches JSX/TSX files at runtime using esbuild
 */
export declare class TsxCompiler {
    private memoryCache;
    private options;
    constructor(options?: CompilerOptions);
    /**
     * Get file modification time
     */
    private getFileModTime;
    /**
     * Generate cache key for a file
     */
    private getCacheKey;
    /**
     * Get cached file path for file-based caching
     */
    private getCacheFilePath;
    /**
     * Check if memory cache is valid
     */
    private isMemoryCacheValid;
    /**
     * Load from file cache
     */
    private loadFromFileCache;
    /**
     * Save to file cache
     */
    private saveToFileCache;
    /**
     * Compile JSX/TSX file to JavaScript
     */
    private compileFile;
    /**
     * Get inlined JSX runtime
     * Returns the h() and Fragment functions as inline code
     */
    private getInlinedRuntime;
    /**
     * Load and execute compiled module
     */
    private loadModule;
    /**
     * Compile a JSX/TSX file and return the module
     * Uses caching when enabled
     *
     * @param filePath - Absolute path to the JSX/TSX file
     * @returns Compiled module exports
     */
    compile(filePath: string): any;
    /**
     * Clear all caches
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        memoryCacheSize: number;
        fileCacheSize: number;
        cachedFiles: string[];
    };
}
