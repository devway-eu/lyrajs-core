import { DbConfigKey } from "../types/index.js";
export declare class DatabaseConfig {
    constructor();
    getConfig(): any;
    get(key: DbConfigKey): any;
}
