import { getRoutePrefix, getRoutes } from './RouteDecorator.js';
/**
 * Register a controller with a router
 * Reads route metadata from decorators and registers routes
 *
 * @param router - The router to register routes on
 * @param controller - The controller class (not instance, just the class itself)
 *
 * @example
 * ```typescript
 * const router = createRouter();
 * registerController(router, UserController);
 * app.use('/api', router);
 * ```
 */
export function registerController(router, controller) {
    const prefix = getRoutePrefix(controller);
    const routes = getRoutes(controller);
    routes.forEach(route => {
        const fullPath = prefix + route.path;
        const method = route.methodName;
        // Get the static method from the controller
        const handler = controller[method];
        if (!handler || typeof handler !== 'function') {
            throw new Error(`Method ${method} not found on controller ${controller.name}. ` +
                `Make sure the method is static.`);
        }
        // Register the route based on HTTP method
        switch (route.method) {
            case 'GET':
                router.get(fullPath, handler);
                break;
            case 'POST':
                router.post(fullPath, handler);
                break;
            case 'PUT':
                router.put(fullPath, handler);
                break;
            case 'DELETE':
                router.delete(fullPath, handler);
                break;
            case 'PATCH':
                router.patch(fullPath, handler);
                break;
        }
    });
}
//# sourceMappingURL=registerController.js.map