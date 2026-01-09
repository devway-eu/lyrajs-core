import "reflect-metadata";
import * as fs from "node:fs";
import * as path from "node:path";
import * as process from "node:process";
import { resolve } from "path";
import { DatabaseSchema } from '../interfaces/DatabaseSchema.js';
/**
 * EntitySchemaBuilder
 * Reads entity classes and builds a DatabaseSchema from their metadata
 */
export class EntitySchemaBuilder {
    /**
     * Build a DatabaseSchema from all entities in src/entity folder
     */
    async buildSchemaFromEntities() {
        const entities = await this.getEntities();
        const schema = new DatabaseSchema();
        for (const entity of entities) {
            const table = this.buildTableDefinition(entity);
            schema.addTable(table);
        }
        return schema;
    }
    /**
     * Build a TableDefinition from an entity instance
     */
    buildTableDefinition(entity) {
        const tableName = Reflect.getMetadata("entity:table", entity) || entity.constructor.name.toLowerCase();
        const columns = Reflect.getMetadata("entity:columns", entity) || [];
        // Convert entity columns to ColumnDefinition[]
        const columnDefs = columns
            .filter((col) => {
            if (!col) {
                console.warn(`Warning: Found undefined column in entity ${tableName}`);
                return false;
            }
            if (!col.name) {
                console.warn(`Warning: Found column without name in entity ${tableName}:`, col);
                return false;
            }
            if (!col.type) {
                console.warn(`Warning: Found column ${col.name} without type in entity ${tableName}`);
                return false;
            }
            return true;
        })
            .map((col) => {
            var _a, _b, _c, _d;
            return ({
                name: col.name,
                type: col.type.toLowerCase(),
                length: col.size,
                nullable: (_a = col.nullable) !== null && _a !== void 0 ? _a : true,
                default: col.default,
                primary: (_b = col.pk) !== null && _b !== void 0 ? _b : false,
                unique: (_c = col.unique) !== null && _c !== void 0 ? _c : false,
                autoIncrement: (_d = col.pk) !== null && _d !== void 0 ? _d : false, // Assume PKs are auto-increment
                comment: undefined
            });
        });
        // Build indexes (from unique columns and foreign keys)
        const indexes = [];
        // Add unique indexes
        const uniqueColumns = columns.filter((col) => col.unique);
        uniqueColumns.forEach((col) => {
            if (!col.name)
                return;
            indexes.push({
                name: `idx_${tableName}_${col.name}`,
                columns: [col.name],
                unique: true,
                type: 'BTREE'
            });
        });
        // Add indexes for foreign keys
        const fks = columns.filter((col) => col.fk === true);
        fks.forEach((fk) => {
            if (!fk.name)
                return;
            const reference = fk.references ? fk.references.split(".") : null;
            if (reference) {
                indexes.push({
                    name: `fk_${tableName}_${fk.name}`,
                    columns: [fk.name],
                    unique: false,
                    type: 'BTREE'
                });
            }
        });
        // Build foreign keys
        const foreignKeys = [];
        fks.forEach((fk) => {
            if (!fk.name)
                return;
            const reference = fk.references ? fk.references.split(".") : null;
            if (reference && reference.length === 2) {
                foreignKeys.push({
                    name: `fk_${tableName}_${fk.name}`,
                    column: fk.name,
                    referencedTable: reference[0],
                    referencedColumn: reference[1],
                    onUpdate: 'RESTRICT',
                    onDelete: fk.onDelete || 'RESTRICT'
                });
            }
        });
        return {
            name: tableName,
            columns: columnDefs,
            indexes,
            foreignKeys
        };
    }
    /**
     * Get all entity instances from the entity folder
     */
    async getEntities() {
        const entities = [];
        const entityFolder = resolve(process.cwd(), "src", "entity");
        if (!fs.existsSync(entityFolder)) {
            return entities;
        }
        const files = fs.readdirSync(entityFolder)
            .filter((f) => (f.endsWith(".ts") || f.endsWith(".js")) && !f.endsWith("~"));
        for (const file of files) {
            const modulePath = path.join(entityFolder, file);
            try {
                const entityModule = await import(`file://${modulePath}`);
                const className = file.replace(/\.(ts|js)$/, "");
                const EntityClass = entityModule[className];
                if (!EntityClass) {
                    console.warn(`Warning: Class ${className} not exported correctly in ${file}`);
                    continue;
                }
                const instance = new EntityClass();
                entities.push(instance);
            }
            catch (error) {
                console.warn(`Warning: Could not load entity from ${file}:`, error);
            }
        }
        return entities;
    }
}
//# sourceMappingURL=EntitySchemaBuilder.js.map