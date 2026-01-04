import { NextFunction, Request, Response } from "@/core/server"
import { UnauthorizedException } from "@/core/errors"

/**
 * Authentication middleware
 * Verifies that a user is authenticated by checking for req.user
 * Throws UnauthorizedException if user is not authenticated
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @example
 * import { isAuthenticated } from '@lyra-js/core'
 * app.get('/protected', isAuthenticated, (req, res) => {
 *   res.json({ user: req.user })
 * })
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedException()
  }

  next()
}
