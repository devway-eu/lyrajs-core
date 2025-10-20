import { NextFunction, Request, Response } from "express"

import { NotFoundException } from "@/core/errors"
import { RouterHelper } from "@/core/security"

export const httpRequestMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const routerRoutes = RouterHelper.listRoutes()
  const routerProvidesReqRoute = routerRoutes.find(
    (route) => route.path === req.originalUrl && route.httpMethod === req.method
  )

  if (!routerProvidesReqRoute) throw new NotFoundException("Route")

  next()
}
