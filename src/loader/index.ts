import {ProjectModuleLoader} from "./UserModuleLoader";

export {Lyra} from "./configLoader"

// Wrap in try-catch to ensure promises always settle
let AppFixtures: any
let User: any
let userRepository: any

try {
  AppFixtures = await ProjectModuleLoader.loadProjectFixtures()
} catch {
  AppFixtures = undefined
}

try {
  User = await ProjectModuleLoader.loadProjectEntity('User')
} catch {
  User = undefined
}

try {
  userRepository = await ProjectModuleLoader.loadProjectRepository('UserRepository')
} catch {
  userRepository = undefined
}

export { AppFixtures, User, userRepository }
