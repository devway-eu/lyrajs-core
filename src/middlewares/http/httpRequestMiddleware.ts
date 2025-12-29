import { NextFunction, Request, Response } from "express"

import { MethodNotAllowedException, NotFoundException } from "@/core/errors"
import { AccessControl } from "@/core/security"
import { RouterHelper } from "@/core/security"
import { userRepository } from "@/core/loader"

export const httpRequestMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if route exists
    const routerRoutes = RouterHelper.listRoutes()
    const routeWithMethod = routerRoutes.find(
      (route) => route.path === req.originalUrl && route.httpMethod === req.method
    )
    const routeExists = routerRoutes.find((route) => route.path === req.originalUrl)

    // Handle route not found or method not allowed
    if (!routeWithMethod) {
      if (routeExists) {
        throw new MethodNotAllowedException(`Method ${req.method} not allowed for this route`)
      } else {
        throw new NotFoundException("Route")
      }
    }

    // Try to get authenticated user (don't throw error if not authenticated)
    (req as any).user = null
    try {
      const token = (req as any).cookies?.Token
      if (token) {
        const decoded = AccessControl.isTokenValid(token)
        if (userRepository && decoded?.id) {
          const user = await userRepository.find(decoded.id)
          if (user) {
            (req as any).user = user
          }
        }
      }
    } catch (error) {
      // Silently fail - user remains null
      (req as any).user = null
    }

    next()
  } catch (error) {
    next(error)
  }
}
