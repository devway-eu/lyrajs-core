import { readdir, readFile, writeFile, unlink } from 'fs/promises';
import { resolve } from 'path';
import ts from 'typescript';
import { pathToFileURL } from 'url';
class LyraConfig {
    async config() {
        return {
            entities: await this.getCompiledExports('src/entity'),
            repositories: await this.getCompiledExports('src/repository'),
            controllers: await this.getCompiledExports('src/controller'),
            migrations: await this.getFilesFromDir('migrations'),
            fixtures: await this.getCompiledExports('fixtures'),
        };
    }
    async getFilesFromDir(dir) {
        const absDir = resolve(process.cwd(), dir);
        const files = await readdir(absDir);
        return files
            .filter(file => file.endsWith('.ts') || file.endsWith('.sql'))
            .map(file => resolve(absDir, file));
    }
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
            return typeof config?.then === 'function' ? await config : config;
        }
        finally {
            await unlink(jsPath);
        }
    }
}
export const Lyra = new LyraConfig();
//# sourceMappingURL=configLoader.js.map