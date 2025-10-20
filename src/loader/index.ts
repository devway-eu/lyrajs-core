import {ProjectModuleLoader} from "./UserModuleLoader";

export {Lyra} from "./configLoader"
export {TmpManager} from "./TmpLoader"

export const AppFixtures = await ProjectModuleLoader.loadProjectFixtures()
export const User = await ProjectModuleLoader.loadProjectEntity('User')
export const userRepository = await ProjectModuleLoader.loadProjectRepository('UserRepository')
