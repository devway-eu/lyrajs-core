import mysql from "mysql2/promise"

import { DatabaseConfig } from "@/core/config"

const dbConfig = new DatabaseConfig().getConfig()

export const db = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
})
