import { NextFunction, Request, Response } from "express"

import { AuthenticatedRequest } from "@/core/types"
// import { User } from "@entity/User"
import { User } from "@/core/loader"
export const isAdmin = (req: AuthenticatedRequest<Request>, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const user = req.user as typeof User

  if (user.role !== "ROLE_ADMIN") {
    return res.status(403).json({ message: "Access denied" })
  }
  next()
}
