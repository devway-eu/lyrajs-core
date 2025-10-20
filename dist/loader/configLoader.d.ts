declare class LyraConfig {
    config(): Promise<{
        entities: any[];
        repositories: any[];
        controllers: any[];
        migrations: string[];
        fixtures: any[];
    }>;
    getFilesFromDir(dir: string): Promise<string[]>;
    getCompiledExports(dir: string): Promise<any[]>;
    compileTsFile(tsFilePath: string): Promise<string>;
    getConfig(): Promise<any>;
}
export declare const Lyra: LyraConfig;
export {};
