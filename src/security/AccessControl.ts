import jwt from "jsonwebtoken"

import { SecurityConfig } from "@/core/config"
import { UnauthorizedException } from "@/core/errors"
import { ProtectedRouteType } from "@/core/types"
import { User } from "@/core/loader"

export class AccessControl {
  static getRoleMap() {
    const hierarchy = new SecurityConfig().getConfig().role_hierarchy
    const resolved: Record<string, Set<string>> = {}

    const resolve = (role: string): Set<string> => {
      if (resolved[role]) return resolved[role]

      const children = Array.isArray(hierarchy[role]) ? hierarchy[role] : [hierarchy[role]]

      const result = new Set<string>(children)
      for (const child of children) {
        if (hierarchy[child]) {
          for (const r of resolve(child)) result.add(r)
        }
      }

      resolved[role] = result
      return result
    }

    for (const role of Object.keys(hierarchy)) resolve(role)
    return resolved
  }

  static isRouteProtected(routePath: string) {
    const securityConfig = new SecurityConfig().getConfig()
    const protectedRoutes = securityConfig.access_control

    const matchingRoutes = protectedRoutes.filter((protectedRoutes: ProtectedRouteType) =>
      protectedRoutes.path.startsWith(routePath)
    )

    return matchingRoutes.length > 0
  }

  static async canAccessRoute(user: typeof User, route: ProtectedRouteType) {
    if (!user || !user.role || !route) throw new UnauthorizedException("No user or route provided")

    const roleMap = AccessControl.getRoleMap()
    const userRoles = new Set<string>([user.role])
    const inheritedRoles = roleMap[user.role]
    if (inheritedRoles) {
      for (const r of inheritedRoles) userRoles.add(r)
    }
    const allowedRoles = route.roles
    return allowedRoles.some((role: string) => userRoles.has(role))
  }

  static async decodeToken(token: string) {
    return jwt.decode(token) as jwt.JwtPayload
  }

  static isTokenValid(token: string) {
    const securityConfig = new SecurityConfig().getConfig()
    return jwt.verify(token, securityConfig.jwt.secret_key, { algorithms: [securityConfig.jwt.algorithm] }) as jwt.JwtPayload
  }

  static checkRefreshTokenValid(refreshToken: string) {
    const securityConfig = new SecurityConfig().getConfig()
    jwt.verify(refreshToken as string, securityConfig.jwt.secret_key_refresh as string, { algorithms: [securityConfig.jwt.algorithm] })
  }

  static async getNewToken(user: typeof User) {
    const securityConfig = new SecurityConfig().getConfig()
    return jwt.sign({ id: user.id }, securityConfig.jwt.secret_key, {
        expiresIn: securityConfig.jwt.token_expiration,
        algorithm: securityConfig.jwt.algorithm
    })
  }

  static async getNewRefreshToken(user: typeof User) {
    const securityConfig = new SecurityConfig().getConfig()
    return jwt.sign({ id: user.id }, securityConfig.jwt.secret_key_refresh, {
      expiresIn: securityConfig.jwt.refresh_token_expiration,
        algorithm: securityConfig.jwt.algorithm
    })
  }

  static hasRoleHigherThan(user: typeof User, role: string): boolean {
    if (!user || !user.role) return false

    const roleMap = AccessControl.getRoleMap()
    const userInheritedRoles = roleMap[user.role]

    if (user.role === role) return false

    return userInheritedRoles ? userInheritedRoles.has(role) : false
  }

  static isOwner(user: typeof User, resourceOwnerId: number | string): boolean {
    if (!user || !user.id || !resourceOwnerId) return false
    return String(user.id) === String(resourceOwnerId)
  }
}
