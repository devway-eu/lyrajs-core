import { NextFunction, Request, Response } from "express"

import { SecurityConfig } from "@/core/config"
import { UnauthorizedException } from "@/core/errors"
import { AccessControl } from "@/core/security"
import { AuthenticatedRequest, ProtectedRouteType } from "@/core/types"
// import { userRepository } from "@repository/UserRepository"
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
      try {
        const decoded = await AccessControl.decodeToken(token)

        if (!decoded || !decoded.id) throw new UnauthorizedException("Invalid token")

        const user = await userRepository.find(decoded.id)

        if (!user || !user.refresh_token) throw new UnauthorizedException("Invalid refresh token")

        AccessControl.checkRefreshTokenValid(user.refresh_token)

        const newToken = await AccessControl.getNewToken(user)

        await userRepository.save({ ...user, refresh_token: newToken })

        res.cookie("Token", newToken, {
          sameSite: "lax",
          httpOnly: true,
          secure: process.env.ENV === "production",
          maxAge: securityConfig.jwt.token_expiration
        })

        req.user = user

        const matchingProtectedRoute = roleHierarchy.find((route: ProtectedRouteType) => route.path === routePath)

        if (!(await AccessControl.canAccessRoute(user, matchingProtectedRoute))) {
          throw new UnauthorizedException("Access denied")
        }

        return next()
      } catch (_refreshError) {
        return res.redirect(securityConfig.auth_routes.sign_out)
      }
    }
  } catch (error) {
    return next(error)
  }
}
