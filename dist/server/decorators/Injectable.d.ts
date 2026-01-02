import 'reflect-metadata';
/**
 * Class decorator that marks a class as injectable for dependency injection
 * @returns {ClassDecorator} - Class decorator function
 */
export declare function Injectable(): (target: any) => void;
/**
 * Property decorator for dependency injection into class properties
 * Automatically resolves and injects dependencies based on property type
 * @returns {PropertyDecorator} - Property decorator function
 */
export declare function Inject(): (target: any, propertyKey: string) => void;
