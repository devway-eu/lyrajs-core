import 'reflect-metadata';
import { Container, Service } from '../server/index.js';
import { Repository as RepositoryBase } from "../orm/index.js";
/** Dependency injection container for managing services, repositories, and controllers */
export class DIContainer extends Container {
    constructor() {
        super(...arguments);
        this.instances = new Map();
        this.services = new Map();
        this.repositories = new Map();
    }
    /**
     * Register a class as a service or repository
     * @param {new (...args: any[]) => T} ClassType - Class constructor to register
     * @returns {void}
     * @template T
     */
    register(ClassType) {
        const type = Reflect.getMetadata('injectableType', ClassType);
        const instance = this.resolve(ClassType);
        const propertyName = ClassType.name.charAt(0).toLowerCase() + ClassType.name.slice(1);
        if (type === 'service') {
            this.services.set(propertyName, instance);
            this[propertyName] = instance;
        }
        else if (type === 'repository') {
            this.repositories.set(propertyName, instance);
            this[propertyName] = instance;
        }
    }
    /**
     * Inject dependencies into all registered services and repositories
     * Should be called after all services/repositories are registered
     * @returns {void}
     */
    injectAll() {
        this.services.forEach((instance) => {
            if (this.extendsClass(instance.constructor, Service)) {
                this.injectDependencies(instance);
            }
        });
        this.repositories.forEach((instance) => {
            if (this.extendsClass(instance.constructor, RepositoryBase)) {
                this.injectDependencies(instance);
            }
        });
    }
    /**
     * Inject services and repositories into an instance as direct properties
     * @param {any} instance - Instance to inject dependencies into
     * @returns {void}
     */
    injectDependencies(instance) {
        this.services.forEach((serviceInstance, propertyName) => {
            Object.defineProperty(instance, propertyName, {
                value: serviceInstance,
                writable: false,
                enumerable: false,
                configurable: false
            });
        });
        this.repositories.forEach((repositoryInstance, propertyName) => {
            Object.defineProperty(instance, propertyName, {
                value: repositoryInstance,
                writable: false,
                enumerable: false,
                configurable: false
            });
        });
    }
    /**
     * Register a custom instance with a specific name
     * @param {string} name - Property name (e.g., 'stripeService')
     * @param {any} instance - Instance to register
     * @param {'service' | 'repository'} [type='service'] - Instance type
     * @returns {void}
     */
    registerInstance(name, instance, type = 'service') {
        if (type === 'service') {
            this.services.set(name, instance);
        }
        else {
            this.repositories.set(name, instance);
        }
        this[name] = instance;
    }
    /**
     * Resolve a class with its dependencies
     * @param {new (...args: any[]) => T} ClassType - Class constructor to resolve
     * @returns {T} - Resolved instance with injected dependencies
     * @template T
     */
    resolve(ClassType) {
        if (this.instances.has(ClassType)) {
            return this.instances.get(ClassType);
        }
        const isInjectable = Reflect.getMetadata('injectable', ClassType);
        if (!isInjectable) {
            return new ClassType();
        }
        const instance = new ClassType();
        const injections = Reflect.getMetadata('injections', ClassType) || [];
        injections.forEach(({ propertyKey, type }) => {
            if (type) {
                const dependency = this.resolve(type);
                instance[propertyKey] = dependency;
            }
        });
        this.instances.set(ClassType, instance);
        return instance;
    }
    /**
     * Inject services and repositories into a controller instance
     * @param {any} controller - Controller instance
     * @returns {void}
     */
    injectIntoController(controller) {
        this.injectDependencies(controller);
    }
    /**
     * Check if a class extends a specific base class
     * @param {any} ClassType - Class to check
     * @param {any} BaseClass - Base class to check against
     * @returns {boolean} - True if ClassType extends BaseClass
     */
    extendsClass(ClassType, BaseClass) {
        return ClassType.prototype instanceof BaseClass;
    }
}
//# sourceMappingURL=DIContainer.js.map