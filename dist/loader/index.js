import { ProjectModuleLoader } from "./UserModuleLoader.js";
export { Lyra } from "./configLoader.js";
export { TmpManager } from "./TmpLoader.js";
export const AppFixtures = await ProjectModuleLoader.loadProjectFixtures();
export const User = await ProjectModuleLoader.loadProjectEntity('User');
export const userRepository = await ProjectModuleLoader.loadProjectRepository('UserRepository');
//# sourceMappingURL=index.js.map