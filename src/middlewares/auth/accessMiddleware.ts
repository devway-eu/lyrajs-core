import { NextFunction, Request, Response } from "@/core/server"

import { SecurityConfig } from "@/core/config"
import { UnauthorizedException } from "@/core/errors"
import { AccessControl } from "@/core/security"
import { ProtectedRouteType } from "@/core/types"

import { getUserRepository } from "@/core/loader"
export const accessMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const routePath = req.url || '/'
    const securityConfig = new SecurityConfig().getConfig()
    const roleHierarchy = securityConfig.role_hierarchy

    if (!AccessControl.isRouteProtected(routePath)) {
      return next()
    }

    // Try to get token from cookies first, then from Authorization header
    let token = req.cookies.Token
    if (!token) {
      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) throw new UnauthorizedException("No token provided")

    try {
      const decoded = AccessControl.isTokenValid(token)
      const userRepository = await getUserRepository()

      if (!userRepository) throw new UnauthorizedException("Repository not available")

      const user = await userRepository.find(decoded.id)

      if (!user) throw new UnauthorizedException("Invalid token")

      req.user = user

      const matchingProtectedRoute = roleHierarchy.find((route: ProtectedRouteType) => route.path === routePath)

      if (!(await AccessControl.canAccessRoute(user, matchingProtectedRoute))) {
        throw new UnauthorizedException("Access denied")
      }

      return next()
    } catch (_jwtError) {
      new UnauthorizedException('invalid token');
    }
  } catch (error) {
    return next(error)
  }
}
