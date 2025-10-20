export declare class RepositoryGeneratorHelper {
    static importsString: (entityName: string) => string;
    static constructorString: (entityName: string) => string;
    static exportString: (entityName: string) => string;
    static getFullRepositoryCode(entityName: string): string;
}
