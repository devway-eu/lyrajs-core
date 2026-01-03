import { NextFunction, Request, Response } from "@/core/server"

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  next()
}
