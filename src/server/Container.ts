/**
 * Abstract base Container class providing dependency injection capabilities
 * Parent class for Controller, Service, and Repository
 * Dependencies are injected as direct properties (e.g., this.userService, this.userRepository)
 */
export abstract class Container {
    [key: string]: any;
}
