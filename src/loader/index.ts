import {ProjectModuleLoader} from "./UserModuleLoader";

export {Lyra} from "./configLoader"

// Lazy loading to avoid circular dependencies
let _AppFixtures: any = null
let _User: any = null
let _userRepository: any = null
let _loading = false

async function ensureLoaded() {
  if (_loading) return
  _loading = true

  try {
    _AppFixtures = await ProjectModuleLoader.loadProjectFixtures()
  } catch {
    _AppFixtures = undefined
  }

  try {
    _User = await ProjectModuleLoader.loadProjectEntity('User')
  } catch {
    _User = undefined
  }

  try {
    _userRepository = await ProjectModuleLoader.loadProjectRepository('UserRepository')
  } catch {
    _userRepository = undefined
  }
}

// Getters that trigger lazy loading
export const getAppFixtures = async () => {
  await ensureLoaded()
  return _AppFixtures
}

export const getUser = async () => {
  await ensureLoaded()
  return _User
}

export const getUserRepository = async () => {
  await ensureLoaded()
  return _userRepository
}

// Deprecated: synchronous exports for backward compatibility (will be undefined initially)
export let AppFixtures: any = undefined
export let User: any = undefined
export let userRepository: any = undefined

// Load asynchronously after module initialization
setTimeout(async () => {
  await ensureLoaded()
  AppFixtures = _AppFixtures
  User = _User
  userRepository = _userRepository
}, 0)
