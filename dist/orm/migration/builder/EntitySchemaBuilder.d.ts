import "reflect-metadata";
import { DatabaseSchema } from '../interfaces/DatabaseSchema.js';
/**
 * EntitySchemaBuilder
 * Reads entity classes and builds a DatabaseSchema from their metadata
 */
export declare class EntitySchemaBuilder<T extends object> {
    /**
     * Build a DatabaseSchema from all entities in src/entity folder
     */
    buildSchemaFromEntities(): Promise<DatabaseSchema>;
    /**
     * Build a TableDefinition from an entity instance
     */
    private buildTableDefinition;
    /**
     * Get all entity instances from the entity folder
     */
    private getEntities;
}
