export declare class TmpLoaderClass {
    constructor();
    private cleanTmpFolder;
    private compileFileToTmp;
    private refreshDir;
    refreshTmpEntities(): Promise<void>;
    refreshTmpControllers(): Promise<void>;
    refreshTmpRepositories(): Promise<void>;
    refreshTmpFixtures(): Promise<void>;
}
export declare const TmpManager: TmpLoaderClass;
