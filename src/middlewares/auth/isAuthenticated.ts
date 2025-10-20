import { NextFunction, Request, Response } from "express"

import { AuthenticatedRequest } from "@/core/types"

export const isAuthenticated = async (req: AuthenticatedRequest<Request>, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  next()
}
