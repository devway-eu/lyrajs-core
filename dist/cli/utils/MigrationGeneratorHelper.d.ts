import "reflect-metadata";
export declare class MigrationGeneratorHelper<T extends object> {
    constructor();
    private getEntities;
    buildCreateTableQueries(): Promise<string[]>;
    generateMigrationFile(queries: string[]): void;
}
