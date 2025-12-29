import { ProjectModuleLoader } from "./UserModuleLoader.js";
export { Lyra } from "./configLoader.js";
// Wrap in try-catch to ensure promises always settle
let AppFixtures;
let User;
let userRepository;
try {
    AppFixtures = await ProjectModuleLoader.loadProjectFixtures();
}
catch {
    AppFixtures = undefined;
}
try {
    User = await ProjectModuleLoader.loadProjectEntity('User');
}
catch {
    User = undefined;
}
try {
    userRepository = await ProjectModuleLoader.loadProjectRepository('UserRepository');
}
catch {
    userRepository = undefined;
}
export { AppFixtures, User, userRepository };
//# sourceMappingURL=index.js.map