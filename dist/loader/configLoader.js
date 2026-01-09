import { readdir, readFile, writeFile, unlink } from 'fs/promises';
import { resolve } from 'path';
import ts from 'typescript';
import { pathToFileURL } from 'url';
/**
 * LyraConfig class
 * Handles dynamic loading and compilation of TypeScript modules
 * Provides access to entities, repositories, controllers, migrations, and fixtures
 */
class LyraConfig {
    /**
     * Retrieves the complete application configuration
     * Compiles and loads all TypeScript modules from project directories
     * @returns {Promise<object>} - Configuration object containing entities, repositories, controllers, migrations, and fixtures
     * @example
     * const config = await Lyra.config()
     * console.log(config.entities) // Array of compiled entity modules
     */
    async config() {
        return {
            entities: await this.getCompiledExports('src/entity'),
            repositories: await this.getCompiledExports('src/repository'),
            controllers: await this.getCompiledExports('src/controller'),
            migrations: await this.getFilesFromDir('migrations'),
            fixtures: await this.getCompiledExports('fixtures'),
        };
    }
    /**
     * Retrieves file paths from a directory
     * Filters for TypeScript and SQL files only
     * @param {string} dir - Directory path relative to project root
     * @returns {Promise<string[]>} - Array of absolute file paths
     * @example
     * const files = await Lyra.getFilesFromDir('migrations')
     */
    async getFilesFromDir(dir) {
        const absDir = resolve(process.cwd(), dir);
        const files = await readdir(absDir);
        return files
            .filter(file => file.endsWith('.ts') || file.endsWith('.sql'))
            .map(file => resolve(absDir, file));
    }
    /**
     * Compiles TypeScript files and imports their exports
     * Transpiles each TypeScript file, imports it, and cleans up compiled JavaScript
     * @param {string} dir - Directory containing TypeScript files
     * @returns {Promise<any[]>} - Array of imported module exports (default or named)
     * @example
     * const entities = await Lyra.getCompiledExports('src/entity')
     */
    async getCompiledExports(dir) {
        const tsFiles = (await this.getFilesFromDir(dir)).filter(f => f.endsWith('.ts'));
        const results = [];
        for (const tsFile of tsFiles) {
            const jsFile = await this.compileTsFile(tsFile);
            const imported = await import(pathToFileURL(jsFile).href);
            results.push(imported.default || imported);
            await unlink(jsFile); // Nettoyage du fichier compilé
        }
        return results;
    }
    /**
     * Compiles a single TypeScript file to JavaScript
     * Uses TypeScript compiler API to transpile with ES2022 target
     * @param {string} tsFilePath - Absolute path to TypeScript file
     * @returns {Promise<string>} - Path to compiled JavaScript file
     * @private
     */
    async compileTsFile(tsFilePath) {
        const content = await readFile(tsFilePath, 'utf-8');
        const output = ts.transpileModule(content, {
            compilerOptions: {
                module: ts.ModuleKind.ES2022,
                target: ts.ScriptTarget.ES2022,
                esModuleInterop: true,
                jsx: ts.JsxEmit.React,
            },
            fileName: tsFilePath,
        });
        const jsFilePath = tsFilePath.replace(/\.ts$/, '.js');
        await writeFile(jsFilePath, output.outputText, 'utf-8');
        return jsFilePath;
    }
    /**
     * Loads and compiles the lyra.config.js file
     * Dynamically imports the configuration and cleans up temporary files
     * @returns {Promise<any>} - Lyra configuration object
     * @throws {Error} - If lyra.config.js file not found or compilation fails
     * @example
     * const config = await Lyra.getConfig()
     */
    async getConfig() {
        const tsPath = resolve(process.cwd(), 'lyra.config.js');
        const jsPath = tsPath.replace(/\.ts$/, '.compiled.js');
        // Lire et compiler le fichier TS
        const content = await readFile(tsPath, 'utf-8');
        const output = ts.transpileModule(content, {
            compilerOptions: {
                module: ts.ModuleKind.ESNext,
                target: ts.ScriptTarget.ES2022,
                esModuleInterop: true,
            },
            fileName: tsPath,
        });
        await writeFile(jsPath, output.outputText, 'utf-8');
        try {
            // Importer dynamiquement
            const imported = await import(pathToFileURL(jsPath).href);
            // Extraire la config
            const config = imported.lyraConfig;
            return typeof (config === null || config === void 0 ? void 0 : config.then) === 'function' ? await config : config;
        }
        finally {
            await unlink(jsPath);
        }
    }
}
/**
 * Singleton instance of LyraConfig
 * Provides centralized access to configuration loading and module compilation
 * @example
 * import { Lyra } from '@lyra-js/core'
 * const config = await Lyra.config()
 */
export const Lyra = new LyraConfig();
//# sourceMappingURL=configLoader.js.map