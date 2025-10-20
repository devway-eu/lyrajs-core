import "reflect-metadata";
import { ColumnType } from "../../orm/index.js";
export declare function Table(): (target: {
    name: string;
}) => void;
export declare function Column(config: ColumnType): (target: object, propertyKey: string) => void;
