import { ProjectModuleLoader } from "./UserModuleLoader.js";
export { Lyra } from "./configLoader.js";
/**
 * Lazy loading module system
 * Prevents circular dependencies by loading User, UserRepository, and AppFixtures on-demand
 * Provides both async and deprecated sync access patterns
 */
// Lazy loading to avoid circular dependencies
let _AppFixtures = null;
let _User = null;
let _userRepository = null;
let _loading = false;
/**
 * Ensures all default modules are loaded
 * Loads AppFixtures, User entity, and UserRepository on first call
 * Subsequent calls are no-ops
 * @private
 */
async function ensureLoaded() {
    if (_loading)
        return;
    _loading = true;
    try {
        _AppFixtures = await ProjectModuleLoader.loadProjectFixtures();
    }
    catch {
        _AppFixtures = undefined;
    }
    try {
        _User = await ProjectModuleLoader.loadProjectEntity('User');
    }
    catch {
        _User = undefined;
    }
    try {
        _userRepository = await ProjectModuleLoader.loadProjectRepository('UserRepository');
    }
    catch {
        _userRepository = undefined;
    }
}
/**
 * Asynchronously retrieves the AppFixtures module
 * Triggers lazy loading if not already loaded
 * @returns {Promise<any>} - AppFixtures module or undefined
 * @example
 * const fixtures = await getAppFixtures()
 */
export const getAppFixtures = async () => {
    await ensureLoaded();
    return _AppFixtures;
};
/**
 * Asynchronously retrieves the User entity module
 * Triggers lazy loading if not already loaded
 * @returns {Promise<any>} - User entity or undefined
 * @example
 * const User = await getUser()
 */
export const getUser = async () => {
    await ensureLoaded();
    return _User;
};
/**
 * Asynchronously retrieves the UserRepository module
 * Triggers lazy loading if not already loaded
 * @returns {Promise<any>} - UserRepository or undefined
 * @example
 * const userRepo = await getUserRepository()
 */
export const getUserRepository = async () => {
    await ensureLoaded();
    return _userRepository;
};
/**
 * @deprecated Use getAppFixtures() instead
 * Synchronous export for backward compatibility
 * Initially undefined, populated asynchronously after module initialization
 */
export let AppFixtures = undefined;
/**
 * @deprecated Use getUser() instead
 * Synchronous export for backward compatibility
 * Initially undefined, populated asynchronously after module initialization
 */
export let User = undefined;
/**
 * @deprecated Use getUserRepository() instead
 * Synchronous export for backward compatibility
 * Initially undefined, populated asynchronously after module initialization
 */
export let userRepository = undefined;
// Load asynchronously after module initialization
setTimeout(async () => {
    await ensureLoaded();
    AppFixtures = _AppFixtures;
    User = _User;
    userRepository = _userRepository;
}, 0);
//# sourceMappingURL=index.js.map