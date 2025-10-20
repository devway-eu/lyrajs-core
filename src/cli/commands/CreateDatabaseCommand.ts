import * as dotenv from "dotenv"
import mysql from "mysql2/promise"

import { LyraConsole } from "@/core/console/LyraConsole"

dotenv.config()
dotenv.config()

export class CreateDatabaseCommand {
  async execute() {
    const connection = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    })

    const dbName = process.env.DB_NAME?.replace(/[^a-zA-Z0-9_]/g, '')

    if (!dbName) throw new Error("Invalid database name")

    await connection.query(`CREATE DATABASE IF NOT EXISTS ??`, [dbName])
    await connection.end()

    LyraConsole.success("Database created", "")
  }
}
