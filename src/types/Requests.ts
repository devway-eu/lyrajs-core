import { Request } from "express"

import { Entity } from "@/core/orm"
import { StdObject } from "@/core/types/StandardTypes"
import { User } from "@/core/loader"

export interface AuthenticatedRequest<T extends object> extends Request {
  originalUrl: string
  cookies: { [key: string]: string }
  user?: typeof User | Entity<T> | StdObject
}
