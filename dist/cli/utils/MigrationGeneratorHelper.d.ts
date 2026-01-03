import "reflect-metadata";
/**
 * MigrationGeneratorHelper class
 * Generates SQL migration files from entity metadata
 * Creates CREATE TABLE and ALTER TABLE statements based on entity decorators
 */
export declare class MigrationGeneratorHelper<T extends object> {
    constructor();
    /**
     * Retrieves all entity instances from the entity folder
     * @returns {Promise<Array<Entity<T> | (new () => T)>>} - Array of entity instances
     */
    private getEntities;
    /**
     * Builds SQL CREATE TABLE and ALTER TABLE queries from entity metadata
     * Processes all entities and generates complete migration SQL
     * @returns {Promise<string[]>} - Array of SQL query strings
     */
    buildCreateTableQueries(): Promise<string[]>;
    /**
     * Generates a timestamped migration file with SQL queries
     * @param {string[]} queries - Array of SQL queries to write
     * @returns {void}
     */
    generateMigrationFile(queries: string[]): void;
}
