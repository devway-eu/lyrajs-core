import * as dotenv from "dotenv"
import mysql from "mysql2/promise"

import { LyraConsole } from "@/core/console/LyraConsole"
import { BackupManager } from "@/core/orm/migration/backup/BackupManager"

dotenv.config()

/**
 * CleanupBackupsCommand class
 * Cleans up old backup files based on retention policy
 * Deletes backups older than specified number of days
 */
export class CleanupBackupsCommand {
  /**
   * Executes the cleanup backups command
   * Removes backup files older than retention period (default: 30 days)
   * @param {string[]} args - Command arguments [--days=N]
   * @returns {Promise<void>}
   */
  async execute(args: string[]) {
    // Parse retention days from args (default: 30)
    let retentionDays = 30
    const daysArg = args.find(arg => arg.startsWith('--days='))
    if (daysArg) {
      retentionDays = parseInt(daysArg.split('=')[1])
      if (isNaN(retentionDays) || retentionDays < 0) {
        LyraConsole.error(
          "Invalid --days value",
          "Usage: npx maestro cleanup:backups [--days=30]"
        )
        return
      }
    }

    const connection = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    })

    try {
      const backupManager = new BackupManager(connection)

      LyraConsole.info(`Cleaning up backups older than ${retentionDays} days...`)

      const deletedCount = await backupManager.cleanupOldBackups(retentionDays)

      if (deletedCount === 0) {
        LyraConsole.success("No old backups to clean up")
      } else {
        LyraConsole.success(
          `Cleanup completed`,
          `Deleted ${deletedCount} old backup file(s)`
        )
      }

      // Show remaining backups info
      const totalSize = backupManager.getTotalBackupSize()
      const backups = backupManager.listBackups()

      if (backups.length > 0) {
        LyraConsole.info(
          `Remaining backups: ${backups.length}`,
          `Total size: ${backupManager.formatSize(totalSize)}`
        )
      }
    } catch (error: any) {
      LyraConsole.error(`Cleanup failed: ${error.message}`)
      throw error
    } finally {
      await connection.end()
    }
  }
}
