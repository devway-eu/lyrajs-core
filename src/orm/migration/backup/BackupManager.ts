import * as fs from 'fs'
import * as path from 'path'
import * as zlib from 'zlib'

/**
 * BackupManager
 * Manages database backups for migrations using pure SQL and Node.js native libraries
 * No external dependencies required (mysqldump, mysql, gzip)
 * Works cross-platform: Windows, Linux, macOS
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
   * Create a full database backup using SQL queries (no mysqldump needed)
   */
  async createBackup(migrationVersion: string): Promise<string> {
    const timestamp = Date.now()
    const filename = `backup_${migrationVersion}_${timestamp}.sql`
    const backupPath = path.join(this.backupDir, filename)

    const database = process.env.DB_NAME

    if (!database) {
      throw new Error('DB_NAME environment variable is required for backup')
    }

    try {
      let sqlDump = ''

      // Add header
      sqlDump += `-- LyraJS Database Backup\n`
      sqlDump += `-- Database: ${database}\n`
      sqlDump += `-- Generated: ${new Date().toISOString()}\n`
      sqlDump += `-- Migration Version: ${migrationVersion}\n\n`
      sqlDump += `SET FOREIGN_KEY_CHECKS=0;\n\n`

      // Get all tables
      const [tables] = await this.connection.query(
        `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'`,
        [database]
      )

      // For each table, get structure and data
      for (const tableRow of tables) {
        const tableName = tableRow.TABLE_NAME

        sqlDump += `-- Table: ${tableName}\n`
        sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`

        // Get CREATE TABLE statement
        const [createResult] = await this.connection.query(`SHOW CREATE TABLE \`${tableName}\``)
        sqlDump += createResult[0]['Create Table'] + ';\n\n'

        // Get table data
        const [rows] = await this.connection.query(`SELECT * FROM \`${tableName}\``)

        if (rows.length > 0) {
          // Get column names
          const columns = Object.keys(rows[0])
          const columnList = columns.map(col => `\`${col}\``).join(', ')

          sqlDump += `-- Data for table ${tableName}\n`

          // Generate INSERT statements in batches
          const batchSize = 100
          for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize)
            const values = batch.map((row: any) => {
              const rowValues = columns.map(col => {
                const value = row[col]
                if (value === null) return 'NULL'
                if (typeof value === 'number') return value
                if (typeof value === 'boolean') return value ? '1' : '0'
                if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`
                if (Buffer.isBuffer(value)) return `0x${value.toString('hex')}`
                // Escape string values
                return `'${String(value).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`
              }).join(', ')
              return `(${rowValues})`
            }).join(',\n  ')

            sqlDump += `INSERT INTO \`${tableName}\` (${columnList}) VALUES\n  ${values};\n`
          }
          sqlDump += '\n'
        }
      }

      sqlDump += `SET FOREIGN_KEY_CHECKS=1;\n`

      // Write to file
      fs.writeFileSync(backupPath, sqlDump, 'utf8')

      // Compress backup to save space
      await this.compressBackupNative(backupPath)

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
   * Create selective backup of specific tables only using SQL queries
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

    const database = process.env.DB_NAME

    if (!database) {
      throw new Error('DB_NAME environment variable is required for backup')
    }

    try {
      let sqlDump = ''

      // Add header
      sqlDump += `-- LyraJS Selective Database Backup\n`
      sqlDump += `-- Database: ${database}\n`
      sqlDump += `-- Tables: ${tables.join(', ')}\n`
      sqlDump += `-- Generated: ${new Date().toISOString()}\n`
      sqlDump += `-- Migration Version: ${migrationVersion}\n\n`
      sqlDump += `SET FOREIGN_KEY_CHECKS=0;\n\n`

      // For each table, get structure and data
      for (const tableName of tables) {
        sqlDump += `-- Table: ${tableName}\n`
        sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`

        // Get CREATE TABLE statement
        const [createResult] = await this.connection.query(`SHOW CREATE TABLE \`${tableName}\``)
        sqlDump += createResult[0]['Create Table'] + ';\n\n'

        // Get table data
        const [rows] = await this.connection.query(`SELECT * FROM \`${tableName}\``)

        if (rows.length > 0) {
          const columns = Object.keys(rows[0])
          const columnList = columns.map(col => `\`${col}\``).join(', ')

          sqlDump += `-- Data for table ${tableName}\n`

          const batchSize = 100
          for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize)
            const values = batch.map((row: any) => {
              const rowValues = columns.map(col => {
                const value = row[col]
                if (value === null) return 'NULL'
                if (typeof value === 'number') return value
                if (typeof value === 'boolean') return value ? '1' : '0'
                if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`
                if (Buffer.isBuffer(value)) return `0x${value.toString('hex')}`
                return `'${String(value).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`
              }).join(', ')
              return `(${rowValues})`
            }).join(',\n  ')

            sqlDump += `INSERT INTO \`${tableName}\` (${columnList}) VALUES\n  ${values};\n`
          }
          sqlDump += '\n'
        }
      }

      sqlDump += `SET FOREIGN_KEY_CHECKS=1;\n`

      // Write to file
      fs.writeFileSync(backupPath, sqlDump, 'utf8')

      // Compress backup
      await this.compressBackupNative(backupPath)

      return `${backupPath}.gz`
    } catch (error: any) {
      if (fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath)
      }
      throw new Error(`Selective backup creation failed: ${error.message}`)
    }
  }

  /**
   * Compress backup file using Node.js native zlib (no external gzip needed)
   */
  private async compressBackupNative(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const input = fs.createReadStream(filePath)
        const output = fs.createWriteStream(`${filePath}.gz`)
        const gzip = zlib.createGzip()

        let inputClosed = false
        let outputClosed = false

        const cleanup = () => {
          if (inputClosed && outputClosed) {
            // Wait a bit for file handles to be fully released (Windows issue)
            setTimeout(() => {
              try {
                // Delete uncompressed file after successful compression
                fs.unlinkSync(filePath)
              } catch (error: any) {
                // If deletion fails, it's not critical - just warn
                console.warn(`Warning: Could not delete uncompressed backup: ${error.message}`)
              }
              resolve()
            }, 100)
          }
        }

        input.on('close', () => {
          inputClosed = true
          cleanup()
        })

        output.on('close', () => {
          outputClosed = true
          cleanup()
        })

        input
          .pipe(gzip)
          .pipe(output)
          .on('error', (error) => {
            // If compression fails, keep uncompressed backup
            console.warn(`Warning: Backup compression failed, keeping uncompressed file: ${error.message}`)
            resolve()
          })
      } catch (error: any) {
        console.warn(`Warning: Backup compression failed, keeping uncompressed file: ${error.message}`)
        resolve()
      }
    })
  }

  /**
   * Restore database from backup file using native SQL execution (no external mysql needed)
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

    const database = process.env.DB_NAME

    if (!database) {
      throw new Error('DB_NAME environment variable is required for restore')
    }

    try {
      let sqlContent = ''

      // Decompress if needed using native zlib
      if (backupPath.endsWith('.gz')) {
        console.log(`${CYAN}Decompressing backup...${RESET}`)
        sqlContent = await this.decompressBackupNative(backupPath)
      } else {
        sqlContent = fs.readFileSync(backupPath, 'utf8')
      }

      // Restore database by executing SQL statements
      console.log(`${CYAN}Restoring database...${RESET}`)

      // Split SQL content into individual statements
      // Remove comments and split by semicolons
      const statements = sqlContent
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0)

      // Execute each statement
      for (const statement of statements) {
        if (statement.trim()) {
          await this.connection.query(statement)
        }
      }

      console.log(`${GREEN}✓ Database restored successfully${RESET}`)
    } catch (error: any) {
      throw new Error(`Restore failed: ${error.message}`)
    }
  }

  /**
   * Decompress backup file using Node.js native zlib
   */
  private async decompressBackupNative(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []
      const input = fs.createReadStream(filePath)
      const gunzip = zlib.createGunzip()

      input
        .pipe(gunzip)
        .on('data', (chunk) => chunks.push(chunk))
        .on('end', () => {
          resolve(Buffer.concat(chunks).toString('utf8'))
        })
        .on('error', (error) => {
          reject(new Error(`Decompression failed: ${error.message}`))
        })
    })
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
