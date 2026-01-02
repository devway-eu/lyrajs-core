import 'reflect-metadata';
import { Container, Service } from '@/core/server';
import { Repository as RepositoryBase } from "@/core/orm";

/** Dependency injection container for managing services, repositories, and controllers */
export class DIContainer extends Container {
    private instances = new Map<any, any>();
    private services = new Map<string, any>();
    private repositories = new Map<string, any>();

    /**
     * Register a class as a service or repository
     * @param {new (...args: any[]) => T} ClassType - Class constructor to register
     * @returns {void}
     * @template T
     */
    register<T>(ClassType: new (...args: any[]) => T): void {
        const type = Reflect.getMetadata('injectableType', ClassType);
        const instance = this.resolve(ClassType);

        const propertyName = ClassType.name.charAt(0).toLowerCase() + ClassType.name.slice(1);

        if (type === 'service') {
            this.services.set(propertyName, instance);
            (this as any)[propertyName] = instance;
        } else if (type === 'repository') {
            this.repositories.set(propertyName, instance);
            (this as any)[propertyName] = instance;
        }
    }

    /**
     * Inject dependencies into all registered services and repositories
     * Should be called after all services/repositories are registered
     * @returns {void}
     */
    injectAll(): void {
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
    private injectDependencies(instance: any): void {
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
    registerInstance(name: string, instance: any, type: 'service' | 'repository' = 'service'): void {
        if (type === 'service') {
            this.services.set(name, instance);
        } else {
            this.repositories.set(name, instance);
        }
        (this as any)[name] = instance;
    }

    /**
     * Resolve a class with its dependencies
     * @param {new (...args: any[]) => T} ClassType - Class constructor to resolve
     * @returns {T} - Resolved instance with injected dependencies
     * @template T
     */
    resolve<T>(ClassType: new (...args: any[]) => T): T {
        if (this.instances.has(ClassType)) {
            return this.instances.get(ClassType);
        }

        const isInjectable = Reflect.getMetadata('injectable', ClassType);
        if (!isInjectable) {
            return new ClassType();
        }

        const instance = new ClassType();

        const injections = Reflect.getMetadata('injections', ClassType) || [];
        injections.forEach(({ propertyKey, type }: any) => {
            if (type) {
                const dependency = this.resolve(type);
                (instance as any)[propertyKey] = dependency;
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
    injectIntoController(controller: any): void {
        this.injectDependencies(controller);
    }

    /**
     * Check if a class extends a specific base class
     * @param {any} ClassType - Class to check
     * @param {any} BaseClass - Base class to check against
     * @returns {boolean} - True if ClassType extends BaseClass
     */
    extendsClass(ClassType: any, BaseClass: any): boolean {
        return ClassType.prototype instanceof BaseClass;
    }
}
