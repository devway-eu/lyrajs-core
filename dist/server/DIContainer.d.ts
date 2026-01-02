import 'reflect-metadata';
import { Container } from '../server/index.js';
/** Dependency injection container for managing services, repositories, and controllers */
export declare class DIContainer extends Container {
    private instances;
    private services;
    private repositories;
    /**
     * Register a class as a service or repository
     * @param {new (...args: any[]) => T} ClassType - Class constructor to register
     * @returns {void}
     * @template T
     */
    register<T>(ClassType: new (...args: any[]) => T): void;
    /**
     * Inject dependencies into all registered services and repositories
     * Should be called after all services/repositories are registered
     * @returns {void}
     */
    injectAll(): void;
    /**
     * Inject services and repositories into an instance as direct properties
     * @param {any} instance - Instance to inject dependencies into
     * @returns {void}
     */
    private injectDependencies;
    /**
     * Register a custom instance with a specific name
     * @param {string} name - Property name (e.g., 'stripeService')
     * @param {any} instance - Instance to register
     * @param {'service' | 'repository'} [type='service'] - Instance type
     * @returns {void}
     */
    registerInstance(name: string, instance: any, type?: 'service' | 'repository'): void;
    /**
     * Resolve a class with its dependencies
     * @param {new (...args: any[]) => T} ClassType - Class constructor to resolve
     * @returns {T} - Resolved instance with injected dependencies
     * @template T
     */
    resolve<T>(ClassType: new (...args: any[]) => T): T;
    /**
     * Inject services and repositories into a controller instance
     * @param {any} controller - Controller instance
     * @returns {void}
     */
    injectIntoController(controller: any): void;
    /**
     * Check if a class extends a specific base class
     * @param {any} ClassType - Class to check
     * @param {any} BaseClass - Base class to check against
     * @returns {boolean} - True if ClassType extends BaseClass
     */
    extendsClass(ClassType: any, BaseClass: any): boolean;
}
