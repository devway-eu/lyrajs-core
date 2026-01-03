export { Lyra } from "./configLoader.js";
/**
 * Asynchronously retrieves the AppFixtures module
 * Triggers lazy loading if not already loaded
 * @returns {Promise<any>} - AppFixtures module or undefined
 * @example
 * const fixtures = await getAppFixtures()
 */
export declare const getAppFixtures: () => Promise<any>;
/**
 * Asynchronously retrieves the User entity module
 * Triggers lazy loading if not already loaded
 * @returns {Promise<any>} - User entity or undefined
 * @example
 * const User = await getUser()
 */
export declare const getUser: () => Promise<any>;
/**
 * Asynchronously retrieves the UserRepository module
 * Triggers lazy loading if not already loaded
 * @returns {Promise<any>} - UserRepository or undefined
 * @example
 * const userRepo = await getUserRepository()
 */
export declare const getUserRepository: () => Promise<any>;
/**
 * @deprecated Use getAppFixtures() instead
 * Synchronous export for backward compatibility
 * Initially undefined, populated asynchronously after module initialization
 */
export declare let AppFixtures: any;
/**
 * @deprecated Use getUser() instead
 * Synchronous export for backward compatibility
 * Initially undefined, populated asynchronously after module initialization
 */
export declare let User: any;
/**
 * @deprecated Use getUserRepository() instead
 * Synchronous export for backward compatibility
 * Initially undefined, populated asynchronously after module initialization
 */
export declare let userRepository: any;
