import * as fs from 'fs'
import * as path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

/**
 * BackupManager
 * Manages database backups for migrations
 * Creates, restores, and cleans up backup files
 */
export class BackupManager {
  private backupDir: string

  constructor(private connection: any) {
    this.backupDir = path.join(process.cwd(), 'backups')
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true })
    }
  }

  /**
   * Create a full database backup before destructive migration
   */
  async createBackup(migrationVersion: string): Promise<string> {
    const timestamp = Date.now()
    const filename = `backup_${migrationVersion}_${timestamp}.sql`
    const backupPath = path.join(this.backupDir, filename)

    const host = process.env.DB_HOST || 'localhost'
    const user = process.env.DB_USER || 'root'
    const password = process.env.DB_PASSWORD || ''
    const database = process.env.DB_NAME

    if (!database) {
      throw new Error('DB_NAME environment variable is required for backup')
    }

    try {
      // Use mysqldump for full backup
      const passwordArg = password ? `-p${password}` : ''
      const command = `mysqldump -h ${host} -u ${user} ${passwordArg} ${database} > "${backupPath}"`

      await execPromise(command)

      // Compress backup to save space
      await this.compressBackup(backupPath)

      return `${backupPath}.gz`
    } catch (error: any) {
      // Clean up failed backup file if it exists
      if (fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath)
      }
      throw new Error(`Backup creation failed: ${error.message}`)
    }
  }

  /**
   * Create selective backup of specific tables only
   */
  async createSelectiveBackup(
    migrationVersion: string,
    tables: string[]
  ): Promise<string> {
    if (tables.length === 0) {
      throw new Error('No tables specified for selective backup')
    }

    const timestamp = Date.now()
    const filename = `backup_${migrationVersion}_${timestamp}_selective.sql`
    const backupPath = path.join(this.backupDir, filename)

    const host = process.env.DB_HOST || 'localhost'
    const user = process.env.DB_USER || 'root'
    const password = process.env.DB_PASSWORD || ''
    const database = process.env.DB_NAME

    if (!database) {
      throw new Error('DB_NAME environment variable is required for backup')
    }

    try {
      const tableList = tables.join(' ')
      const passwordArg = password ? `-p${password}` : ''
      const command = `mysqldump -h ${host} -u ${user} ${passwordArg} ${database} ${tableList} > "${backupPath}"`

      await execPromise(command)
      await this.compressBackup(backupPath)

      return `${backupPath}.gz`
    } catch (error: any) {
      if (fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath)
      }
      throw new Error(`Selective backup creation failed: ${error.message}`)
    }
  }

  /**
   * Compress backup file using gzip
   */
  private async compressBackup(filePath: string): Promise<void> {
    try {
      await execPromise(`gzip "${filePath}"`)
    } catch (error: any) {
      // If compression fails, keep uncompressed backup
      console.warn(`Warning: Backup compression failed, keeping uncompressed file: ${error.message}`)
    }
  }

  /**
   * Restore database from backup file
   */
  async restore(backupPath: string): Promise<void> {
    const YELLOW = '\x1b[33m'
    const GREEN = '\x1b[32m'
    const CYAN = '\x1b[36m'
    const RESET = '\x1b[0m'

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`)
    }

    console.log(`${YELLOW}⚠ Restoring from backup: ${path.basename(backupPath)}${RESET}`)

    const host = process.env.DB_HOST || 'localhost'
    const user = process.env.DB_USER || 'root'
    const password = process.env.DB_PASSWORD || ''
    const database = process.env.DB_NAME

    if (!database) {
      throw new Error('DB_NAME environment variable is required for restore')
    }

    try {
      // Decompress if needed
      let sqlFile = backupPath
      if (backupPath.endsWith('.gz')) {
        console.log(`${CYAN}Decompressing backup...${RESET}`)
        const decompressedPath = backupPath.replace('.gz', '')
        await execPromise(`gzip -dc "${backupPath}" > "${decompressedPath}"`)
        sqlFile = decompressedPath
      }

      // Restore database
      console.log(`${CYAN}Restoring database...${RESET}`)
      const passwordArg = password ? `-p${password}` : ''
      const command = `mysql -h ${host} -u ${user} ${passwordArg} ${database} < "${sqlFile}"`
      await execPromise(command)

      // Clean up decompressed file if we created it
      if (sqlFile !== backupPath && fs.existsSync(sqlFile)) {
        fs.unlinkSync(sqlFile)
      }

      console.log(`${GREEN}✓ Database restored successfully${RESET}`)
    } catch (error: any) {
      throw new Error(`Restore failed: ${error.message}`)
    }
  }

  /**
   * List all available backups
   */
  listBackups(): Array<{ file: string; path: string; size: number; created: Date }> {
    if (!fs.existsSync(this.backupDir)) {
      return []
    }

    const files = fs.readdirSync(this.backupDir)
    const backups = files
      .filter(file => file.startsWith('backup_') && (file.endsWith('.sql') || file.endsWith('.sql.gz')))
      .map(file => {
        const filePath = path.join(this.backupDir, file)
        const stats = fs.statSync(filePath)
        return {
          file,
          path: filePath,
          size: stats.size,
          created: stats.mtime
        }
      })
      .sort((a, b) => b.created.getTime() - a.created.getTime())

    return backups
  }

  /**
   * Clean up old backups based on retention policy
   */
  async cleanupOldBackups(retentionDays: number = 30): Promise<number> {
    if (!fs.existsSync(this.backupDir)) {
      return 0
    }

    const GREEN = '\x1b[32m'
    const YELLOW = '\x1b[33m'
    const RESET = '\x1b[0m'

    const files = fs.readdirSync(this.backupDir)
    const now = Date.now()
    const maxAge = retentionDays * 24 * 60 * 60 * 1000
    let deletedCount = 0

    for (const file of files) {
      if (!file.startsWith('backup_')) continue

      const filePath = path.join(this.backupDir, file)
      const stats = fs.statSync(filePath)
      const age = now - stats.mtimeMs

      if (age > maxAge) {
        fs.unlinkSync(filePath)
        console.log(`${YELLOW}Deleted old backup: ${file}${RESET}`)
        deletedCount++
      }
    }

    if (deletedCount > 0) {
      console.log(`${GREEN}✓ Cleaned up ${deletedCount} old backup(s)${RESET}`)
    }

    return deletedCount
  }

  /**
   * Get total size of all backups
   */
  getTotalBackupSize(): number {
    if (!fs.existsSync(this.backupDir)) {
      return 0
    }

    const files = fs.readdirSync(this.backupDir)
    let totalSize = 0

    for (const file of files) {
      if (file.startsWith('backup_')) {
        const filePath = path.join(this.backupDir, file)
        const stats = fs.statSync(filePath)
        totalSize += stats.size
      }
    }

    return totalSize
  }

  /**
   * Format bytes to human-readable size
   */
  formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`
  }
}
