import { NextFunction, Request, Response } from "express"

import { SecurityConfig } from "@/core/config"
import { UnauthorizedException } from "@/core/errors"
import { AccessControl } from "@/core/security"
import { AuthenticatedRequest, ProtectedRouteType } from "@/core/types"

import { userRepository } from "@/core/loader"
export const accessMiddleware = async (req: AuthenticatedRequest<Request>, res: Response, next: NextFunction) => {
  try {
    const routePath = req.originalUrl
    const securityConfig = new SecurityConfig().getConfig()
    const roleHierarchy = securityConfig.role_hierarchy

    if (!AccessControl.isRouteProtected(routePath)) {
      return next()
    }

    const token = req.cookies.Token

    if (!token) throw new UnauthorizedException("No token provided")

    try {
      const decoded = AccessControl.isTokenValid(token)

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
