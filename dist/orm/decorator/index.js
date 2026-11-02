import "reflect-metadata";
export function Table() {
    return (target) => {
        const tableName = Reflect.getMetadata("entity:table", target) || target.name.toLowerCase();
        Reflect.defineMetadata("entity:table", tableName, target);
    };
}
export function Column(config) {
    return (target, propertyKey) => {
        var _a;
        const columns = (_a = Reflect.getMetadata("entity:columns", target)) !== null && _a !== void 0 ? _a : [];
        columns.push({ name: propertyKey, ...config });
        Reflect.defineMetadata("entity:columns", columns, target);
    };
}
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
export function Relation(config) {
    return (target, propertyKey) => {
        var _a;
        const relations = (_a = Reflect.getMetadata("entity:relations", target)) !== null && _a !== void 0 ? _a : {};
        relations[propertyKey] = config;
        Reflect.defineMetadata("entity:relations", relations, target);
    };
}
//# sourceMappingURL=index.js.map