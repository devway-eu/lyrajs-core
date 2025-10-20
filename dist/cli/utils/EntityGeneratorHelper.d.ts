import { ColumnType } from "../../orm/index.js";
export declare class EntityGeneratorHelper {
    static starts: {
        table: string;
        column: string;
    };
    static ends: {
        table: string;
        column: string;
    };
    static importsString: () => string;
    static tableDecorator: () => string;
    static constructorString: (entityName: string) => string;
    static columnDecorator: (property: ColumnType) => string;
    static propertyString: (property: ColumnType) => string;
    static propertyWithDecorator: (property: ColumnType) => string;
    static getFullEntityCode(entityName: string, properties: ColumnType[]): string;
}
