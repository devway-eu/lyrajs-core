import "reflect-metadata";
import { ColumnType } from "../../orm/index.js";
export declare function Table(): (target: {
    name: string;
}) => void;
export declare function Column(config: ColumnType): (target: object, propertyKey: string) => void;
/**
 * Relation decorator for non-persisted relation properties
 * Defines relationship metadata for use with with() and withAll() methods
 * @param config - Relation configuration
 * @example
 * // ManyToMany
 * @Relation({ type: "manyToMany", entity: "Tag", through: "PostTag", foreignKey: "post", targetKey: "tag" })
 * tags: Tag[] = []
 *
 * // ManyToOne
 * @Relation({ type: "manyToOne", entity: "Category", foreignKey: "category_id" })
 * category: Category | null = null
 *
 * // OneToMany
 * @Relation({ type: "oneToMany", entity: "Post", foreignKey: "category_id" })
 * posts: Post[] = []
 */
export declare function Relation(config: {
    type: "oneToOne" | "oneToMany" | "manyToOne" | "manyToMany";
    entity: string;
    foreignKey?: string;
    through?: string;
    targetKey?: string;
}): (target: object, propertyKey: string) => void;
