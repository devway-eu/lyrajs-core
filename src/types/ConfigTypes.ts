export interface ConfigFile {
  name: string
  fullPath: string
}

export type DbConfigKey = "host" | "port" | "user" | "password" | "name"

export type DbConfig = {
  host: "localhost"
  port: string | number
  user: string
  password: string
  name: string
}

export type SecurityConfigKey = "jwt" | "access_control" | "role_hierarchy"

export type SecurityConfigType = {
  jwt: {
    secret_key: string
    secret_key_REFRESH: string
  }
  access_control: ProtectedRouteType[]
  role_hierarchy: Record<string, string[]>
}

export type ProtectedRouteType = {
  path: string
  roles: string[]
}
