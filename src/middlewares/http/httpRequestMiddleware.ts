import { NextFunction, Request, Response } from "@/core/server"

import { MethodNotAllowedException, NotFoundException } from "@/core/errors"
import { AccessControl } from "@/core/security"
import { RouterHelper } from "@/core/security"
import { getUserRepository } from "@/core/loader"

// Helper function to match route patterns with parameters
const matchRoute = (pattern: string, path: string): boolean => {
  // Convert route pattern to regex (e.g., "/user/:id" -> /^\/user\/[^\/]+$/)
  const regexPattern = pattern
    .replace(/:[^/]+/g, '[^/]+') // Replace :param with regex
    .replace(/\//g, '\\/') // Escape slashes
  const regex = new RegExp(`^${regexPattern}$`)
  return regex.test(path)
}

export const httpRequestMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to get authenticated user (don't throw error if not authenticated)
    req.user = null

    // Try to get token from cookies first, then from Authorization header
    let token = req.cookies?.Token
    if (!token) {
      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (token) {
      try {
        const UserRepositoryClass = await getUserRepository()
        if (UserRepositoryClass) {
          const userRepository = new UserRepositoryClass()
          const decoded = AccessControl.isTokenValid(token)
          if (decoded?.id) {
            const user = await userRepository.find(decoded.id)
            if (user) {
              req.user = user
            }
          }
        }
      } catch (error) {
        // Token invalid/expired or user not found - silently continue
        req.user = null
      }
    }

    next()
  } catch (error) {
    next(error)
  }
}
