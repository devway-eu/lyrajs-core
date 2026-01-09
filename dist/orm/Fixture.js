import { Container } from "../server/Container.js";
/**
 * Base Fixture class for seeding database with test or initial data
 * Extends Container to provide dependency injection capabilities
 * Supports dependency resolution for proper execution order
 */
export class Fixture extends Container {
    constructor() {
        super(...arguments);
        /**
         * Optional array of fixture classes that must be loaded before this one
         * Used for automatic dependency resolution and execution ordering
         * @example
         * dependencies = [UserFixtures, RoleFixtures]
         */
        this.dependencies = [];
    }
}
//# sourceMappingURL=Fixture.js.map