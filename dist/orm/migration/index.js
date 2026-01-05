/**
 * LyraJS Migration System - Phase 1
 * Export all migration components
 */
// Interfaces
export * from './interfaces/types.js';
export * from './interfaces/MigrationInterface.js';
export * from './interfaces/DatabaseSchema.js';
// Core Components
export { SchemaIntrospector } from './introspector/SchemaIntrospector.js';
export { SchemaDiffer } from './differ/SchemaDiffer.js';
export { EntitySchemaBuilder } from './builder/EntitySchemaBuilder.js';
export { MigrationGenerator } from './generator/MigrationGenerator.js';
export { MigrationExecutor } from './executor/MigrationExecutor.js';
export { MigrationValidator } from './validator/MigrationValidator.js';
export { MigrationLockManager } from './lock/MigrationLockManager.js';
export { MigrationSquasher } from './squasher/MigrationSquasher.js';
//# sourceMappingURL=index.js.map