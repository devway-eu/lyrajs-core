import { readdir, rm, mkdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, extname } from 'path';
import { __lyraRootDir, __projectRootDir } from "../index.js";
import ts from "typescript";
export class TmpLoaderClass {
    constructor() {
        return this;
    }
    // async init() {
    //     await this.ensureTmpFolders()
    //     return this
    // }
    //
    // private async ensureTmpFolders() {
    //
    //     const folders = ['entity', 'controller', 'repository', 'fixtures']
    //     for (const folder of folders) {
    //         const dir = join(__lyraRootDir, folder)
    //         if (!existsSync(dir)) await mkdir(dir, { recursive: true })
    //     }
    // }
    async cleanTmpFolder(folder) {
        const full = join(__lyraRootDir, folder);
        if (existsSync(full))
            await rm(full, { recursive: true, force: true });
        await mkdir(full, { recursive: true });
    }
    async compileFileToTmp(source, outDir) {
        const srcSplitted = source.split("/");
        const srcFile = srcSplitted[srcSplitted.length - 1];
        const jsPath = outDir + srcFile.replace(/\.ts$/, '.js');
        const content = await readFile(source, 'utf-8');
        const output = ts.transpileModule(content, {
            compilerOptions: {
                module: ts.ModuleKind.ES2022,
                target: ts.ScriptTarget.ES2022,
                esModuleInterop: true,
            },
            fileName: source,
        });
        await writeFile(jsPath, output.outputText, 'utf-8');
        // return new Promise<void>((resolvePromise, reject) => {
        //     exec(
        //         `tsc "${source}" --outDir "${outDir}" --module ES2022 --target ES2022 --experimentalDecorators --emitDecoratorMetadata`,
        //         (err, stdout, stderr) => {
        //             if (err) return reject(stderr)
        //             resolvePromise()
        //         }
        //     )
        // })
    }
    async refreshDir(sourceSubdir, tmpSubdir) {
        const sourceDir = join(__projectRootDir, sourceSubdir);
        const outDir = join(__lyraRootDir, tmpSubdir);
        await this.cleanTmpFolder(tmpSubdir);
        const files = (await readdir(sourceDir)).filter((f) => extname(f) === '.js');
        for (const file of files) {
            const abs = join(sourceDir, file);
            await this.compileFileToTmp(abs, outDir);
        }
    }
    async refreshTmpEntities() {
        await this.refreshDir('src/entity', '.lyra-cache/entity');
    }
    async refreshTmpControllers() {
        await this.refreshDir('src/controller', '.lyra-cache/controller');
    }
    async refreshTmpRepositories() {
        await this.refreshDir('src/repository', '.lyra-cache/repository');
    }
    async refreshTmpFixtures() {
        await this.refreshDir('src/fixtures', '.lyra-cache/fixtures');
    }
}
export const TmpManager = new TmpLoaderClass();
//# sourceMappingURL=TmpLoader.js.map