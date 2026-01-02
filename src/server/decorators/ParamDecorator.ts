import 'reflect-metadata';

/** Parameter metadata stored by @Param decorator */
export interface ParamMetadata {
    parameterIndex: number;
    routeParamName: string;
    entityType: any;
}

const PARAM_METADATA_KEY = Symbol('paramMetadata');

/**
 * Parameter decorator for automatic entity resolution from route parameters
 * Resolves entities from route parameters using repositories (legacy approach)
 * @param {string} routeParamName - The name of the route parameter (e.g., 'userId' for /:userId)
 * @param {any} entityType - The entity class type (e.g., User)
 * @returns {ParameterDecorator} - Parameter decorator function
 * @example
 * @Get({ path: '/:userId' })
 * async getUser(
 *     req: Request,
 *     res: Response,
 *     @Param('userId', User) user: User
 * ) {
 *     if (!user) return this.notFound(res, 'User not found');
 *     this.ok(res, user);
 * }
 */
export function Param(routeParamName: string, entityType: any): ParameterDecorator {
    return function (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) {
        // Parameter decorators on methods should always have a propertyKey
        if (!propertyKey) {
            throw new Error('@Param decorator can only be used on method parameters');
        }

        const existingMetadata: ParamMetadata[] = Reflect.getMetadata(
            PARAM_METADATA_KEY,
            target,
            propertyKey
        ) || [];

        existingMetadata.push({
            parameterIndex,
            routeParamName,
            entityType
        });

        Reflect.defineMetadata(
            PARAM_METADATA_KEY,
            existingMetadata,
            target,
            propertyKey
        );
    };
}

/**
 * Retrieve parameter metadata for a method
 * @param {any} target - Target class prototype
 * @param {string} methodName - Method name
 * @returns {ParamMetadata[]} - Array of parameter metadata
 */
export function getParamMetadata(target: any, methodName: string): ParamMetadata[] {
    return Reflect.getMetadata(PARAM_METADATA_KEY, target, methodName) || [];
}
