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
//# sourceMappingURL=index.js.map