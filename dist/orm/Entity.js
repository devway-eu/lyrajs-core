import "reflect-metadata";
/**
 * Entity base class
 * Base class for all database entities in LyraJS ORM
 * Provides id property and automatic property assignment from partial objects
 * Includes generic relation loading methods (with, withAll)
 * @template T - The entity type
 * @example
 * class User extends Entity<User> {
 *   name: string
 *   email: string
 * }
 * const user = new User({ name: 'John', email: 'john@example.com' })
 * await user.with('posts') // Load posts relation
 * await user.withAll() // Load all relations
 */
export class Entity {
    /**
     * Creates a new Entity instance
     * Automatically assigns properties from provided object
     * @param {Partial<T> | T} entity - Partial or complete entity data
     * @returns {Entity<T>} - Entity instance with assigned properties
     */
    constructor(entity) {
        this.id = null;
        if (entity) {
            Object.assign(this, entity);
        }
        return this;
    }
    /**
     * Gets all available relations including auto-detected relations
     * Auto-detects:
     * - manyToOne: from FK columns on this entity (fk: true, references)
     * - oneToMany: by checking if properties exist that are arrays (e.g., posts: Post[])
     * @returns {RelationMetadata} - Combined relation metadata
     * @private
     */
    getAllRelations() {
        // Get relations defined with @Relation() decorator
        const decoratorRelations = Reflect.getMetadata("entity:relations", this.constructor.prototype) || {};
        const relationMetadata = {};
        // Convert decorator format to internal format
        for (const [propertyName, config] of Object.entries(decoratorRelations)) {
            const relConfig = config;
            if (relConfig.type === "manyToMany") {
                relationMetadata[propertyName] = {
                    type: "manyToMany",
                    relatedEntity: relConfig.entity,
                    foreignKey: relConfig.foreignKey || "",
                    junctionEntity: relConfig.through || "",
                    junctionForeignKey: relConfig.foreignKey || "",
                    targetForeignKey: relConfig.targetKey || ""
                };
            }
            else if (relConfig.type === "manyToOne") {
                relationMetadata[propertyName] = {
                    type: "manyToOne",
                    relatedEntity: relConfig.entity,
                    foreignKey: relConfig.foreignKey || propertyName
                };
            }
            else if (relConfig.type === "oneToMany") {
                relationMetadata[propertyName] = {
                    type: "oneToMany",
                    relatedEntity: relConfig.entity,
                    foreignKey: relConfig.foreignKey || ""
                };
            }
            else if (relConfig.type === "oneToOne") {
                relationMetadata[propertyName] = {
                    type: "manyToOne", // OneToOne is handled same as ManyToOne
                    relatedEntity: relConfig.entity,
                    foreignKey: relConfig.foreignKey || propertyName
                };
            }
        }
        // Also auto-detect manyToOne from FK columns (for backward compatibility)
        const columns = Reflect.getMetadata("entity:columns", this.constructor.prototype) || [];
        columns.forEach((col) => {
            if (col.fk && col.references && col.name) {
                // Extract entity name from references (e.g., "user.id" → "User")
                const referencedEntity = col.references.split('.')[0];
                const capitalizedEntity = referencedEntity.charAt(0).toUpperCase() + referencedEntity.slice(1);
                // Use the FK column name directly as the property name (e.g., "author")
                // This allows users to name FK properties however they want
                const propertyName = col.name;
                // Only add if not already defined by decorator
                if (!relationMetadata[propertyName]) {
                    relationMetadata[propertyName] = {
                        type: "manyToOne",
                        relatedEntity: capitalizedEntity,
                        foreignKey: col.name
                    };
                }
            }
        });
        return relationMetadata;
    }
    /**
     * Loads one or multiple relations for this entity
     * Uses QueriesBatcher to load multiple relations in parallel for better performance
     * Auto-detects manyToOne relations from FK columns (fk: true, references)
     * @param {string | string[]} relations - Single relation name or array of relation names
     * @returns {Promise<this>} - Returns this for method chaining
     * @example
     * await user.with('posts')
     * await user.with(['posts', 'comments'])
     * await post.with('category') // Auto-detected from category_id FK
     */
    async with(relations) {
        const relationNames = Array.isArray(relations) ? relations : [relations];
        const relationMetadata = this.getAllRelations();
        if (!relationMetadata || Object.keys(relationMetadata).length === 0) {
            return this;
        }
        // If loading multiple relations, batch them for parallel execution
        if (relationNames.length > 1) {
            const { QueriesBatcher } = await import("../services/QueriesBatcher.js");
            const batcher = new QueriesBatcher();
            relationNames.forEach((relationName) => {
                const relation = relationMetadata[relationName];
                if (!relation) {
                    console.warn(`Relation "${relationName}" not found on entity ${this.constructor.name}`);
                    return;
                }
                batcher.add(this.loadRelation(relationName, relation));
            });
            await batcher.execute();
        }
        else {
            // Single relation - load directly
            const relationName = relationNames[0];
            const relation = relationMetadata[relationName];
            if (!relation) {
                console.warn(`Relation "${relationName}" not found on entity ${this.constructor.name}`);
                return this;
            }
            await this.loadRelation(relationName, relation);
        }
        return this;
    }
    /**
     * Loads all defined relations for this entity
     * Includes both explicit relations and auto-detected FK (manyToOne) relations
     * @returns {Promise<this>} - Returns this for method chaining
     * @example
     * await user.withAll()
     * await post.withAll() // Loads category (auto-detected FK), tags, comments, etc.
     */
    async withAll() {
        const relationMetadata = this.getAllRelations();
        if (!relationMetadata || Object.keys(relationMetadata).length === 0) {
            return this;
        }
        const relationNames = Object.keys(relationMetadata);
        await this.with(relationNames);
        return this;
    }
    /**
     * Internal method to load a single relation
     * Handles One-to-Many, Many-to-Many, and Many-to-One (belongsTo) relationships
     * Uses QueriesBatcher to avoid await in loops for better performance
     * @param {string} propertyName - Name of the property to populate
     * @param {object} relation - Relation metadata
     * @returns {Promise<void>}
     * @private
     */
    async loadRelation(propertyName, relation) {
        // Dynamically import dependencies
        const { Repository } = await import("../orm/Repository.js");
        const { QueriesBatcher } = await import("../services/QueriesBatcher.js");
        if (relation.type === "manyToOne") {
            // Many-to-One (BelongsTo): Load single related entity
            // Get the foreign key value - ensure we get the ID, not the object
            let foreignKeyValue = this[relation.foreignKey];
            // If the value is already an object with an id property, extract the id
            if (foreignKeyValue && typeof foreignKeyValue === 'object' && 'id' in foreignKeyValue) {
                foreignKeyValue = foreignKeyValue.id;
            }
            if (!foreignKeyValue) {
                ;
                this[propertyName] = null;
                return;
            }
            // Get related entity class
            const relatedEntityModule = await import(`@entity/${relation.relatedEntity}`);
            const RelatedEntityClass = relatedEntityModule[relation.relatedEntity];
            // Fetch the related entity
            const relatedRepository = new Repository(RelatedEntityClass);
            const entity = await relatedRepository.find(foreignKeyValue);
            this[propertyName] = entity;
        }
        else if (relation.type === "manyToMany" && relation.junctionEntity && relation.junctionForeignKey && relation.targetForeignKey) {
            // Many-to-Many: Query through junction table
            // 1. Get junction entity class
            const junctionEntityModule = await import(`@entity/${relation.junctionEntity}`);
            const JunctionEntityClass = junctionEntityModule[relation.junctionEntity];
            // 2. Query junction table
            const junctionRepository = new Repository(JunctionEntityClass);
            const junctionRecords = await junctionRepository.findBy({ [relation.junctionForeignKey]: this.id });
            // 3. Extract target IDs
            const targetIds = junctionRecords.map((record) => record[relation.targetForeignKey]);
            if (targetIds.length === 0) {
                ;
                this[propertyName] = [];
                return;
            }
            // 4. Get target entity class
            const targetEntityModule = await import(`@entity/${relation.relatedEntity}`);
            const TargetEntityClass = targetEntityModule[relation.relatedEntity];
            // 5. Batch fetch all target entities using QueriesBatcher
            const targetRepository = new Repository(TargetEntityClass);
            const batcher = new QueriesBatcher();
            // Add all find queries to the batcher
            targetIds.forEach((targetId) => {
                batcher.add(targetRepository.find(targetId));
            });
            // Execute all queries in parallel and get results
            const results = await batcher.executeAndGetResponses();
            // Filter out null results
            const entities = results.filter((entity) => entity !== null);
            this[propertyName] = entities;
        }
        else {
            // One-to-Many: Direct query
            // 1. Get related entity class
            const relatedEntityModule = await import(`@entity/${relation.relatedEntity}`);
            const RelatedEntityClass = relatedEntityModule[relation.relatedEntity];
            // 2. Determine FK column name (auto-detect if not provided)
            let foreignKeyName = relation.foreignKey;
            if (!foreignKeyName) {
                // Auto-detect FK by scanning related entity's columns for reference to THIS entity
                // Note: Column decorator stores metadata on the prototype, not the constructor
                const relatedColumns = Reflect.getMetadata("entity:columns", RelatedEntityClass.prototype) || [];
                const currentEntityName = this.constructor.name.toLowerCase();
                // Find column that references this entity
                const fkColumn = relatedColumns.find((col) => {
                    if (col.fk && col.references) {
                        const referencedEntity = col.references.split('.')[0].toLowerCase();
                        return referencedEntity === currentEntityName;
                    }
                    return false;
                });
                if (fkColumn) {
                    foreignKeyName = fkColumn.name;
                }
                else {
                    // Fallback: try common naming patterns (entity_id or entity)
                    const currentEntityCamelCase = currentEntityName.charAt(0).toLowerCase() + currentEntityName.slice(1);
                    foreignKeyName = currentEntityCamelCase + '_id';
                }
            }
            // 3. Query related entities
            const relatedRepository = new Repository(RelatedEntityClass);
            const entities = await relatedRepository.findBy({ [foreignKeyName]: this.id });
            this[propertyName] = entities;
        }
    }
}
//# sourceMappingURL=Entity.js.map