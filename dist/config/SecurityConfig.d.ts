import { SecurityConfigKey } from "../types/index.js";
export declare class SecurityConfig {
    constructor();
    getConfig(): any;
    get(key: SecurityConfigKey): any;
}
