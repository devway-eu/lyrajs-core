import mysql from "mysql2/promise";
import { DatabaseConfig } from "../config/index.js";
const dbConfig = new DatabaseConfig().getConfig();
/**
 * MySQL database connection pool
 * Configured from database.yaml settings with connection pooling enabled
 * Features keep-alive connections and unlimited queue for reliability
 * @example
 * import { db } from '@lyra-js/core'
 * const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId])
 */
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
});
//# sourceMappingURL=Database.js.map