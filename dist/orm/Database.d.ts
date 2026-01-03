import mysql from "mysql2/promise";
/**
 * MySQL database connection pool
 * Configured from database.yaml settings with connection pooling enabled
 * Features keep-alive connections and unlimited queue for reliability
 * @example
 * import { db } from '@lyra-js/core'
 * const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId])
 */
export declare const db: mysql.Pool;
