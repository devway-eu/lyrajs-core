import 'reflect-metadata';

/**
 * Class decorator that marks a class as injectable for dependency injection
 * @returns {ClassDecorator} - Class decorator function
 */
export function Injectable() {
    return function(target: any) {
        Reflect.defineMetadata('injectable', true, target);
    };
}

/**
 * Property decorator for dependency injection into class properties
 * Automatically resolves and injects dependencies based on property type
 * @returns {PropertyDecorator} - Property decorator function
 */
export function Inject() {
    return function (target: any, propertyKey: string) {
        const type = Reflect.getMetadata('design:type', target, propertyKey);

        const injections = Reflect.getMetadata('injections', target.constructor) || [];
        injections.push({ propertyKey, type });
        Reflect.defineMetadata('injections', injections, target.constructor);
    };
}
