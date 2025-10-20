export declare class Config {
    private folderPath;
    private configFiles;
    constructor();
    get(fullKey: string): any;
    getParam(param: string): any;
    private configFileExists;
}
