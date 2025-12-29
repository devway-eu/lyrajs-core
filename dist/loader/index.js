import { ProjectModuleLoader } from "./UserModuleLoader.js";
export { Lyra } from "./configLoader.js";
// Lazy loading to avoid circular dependencies
let _AppFixtures = null;
let _User = null;
let _userRepository = null;
let _loading = false;
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
// Getters that trigger lazy loading
export const getAppFixtures = async () => {
    await ensureLoaded();
    return _AppFixtures;
};
export const getUser = async () => {
    await ensureLoaded();
    return _User;
};
export const getUserRepository = async () => {
    await ensureLoaded();
    return _userRepository;
};
// Deprecated: synchronous exports for backward compatibility (will be undefined initially)
export let AppFixtures = undefined;
export let User = undefined;
export let userRepository = undefined;
// Load asynchronously after module initialization
setTimeout(async () => {
    await ensureLoaded();
    AppFixtures = _AppFixtures;
    User = _User;
    userRepository = _userRepository;
}, 0);
//# sourceMappingURL=index.js.map