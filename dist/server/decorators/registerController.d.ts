import { Router } from '../Router.js';
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
export declare function registerController(router: Router, controller: Function): void;
