import { StdNativeType } from "@/core/types"

export type SqlValueType =
  // NUMBERS
  | "TINYINT"
  | "tinyint"
  | "SMALLINT"
  | "smallint"
  | "MEDIUMINT"
  | "mediumint"
  | "INT"
  | "int"
  | "INTEGER"
  | "integer"
  | "BIGINT"
  | "bigint"
  | "BOOL"
  | "bool"
  | "FLOAT"
  | "float"
  | "DOUBLE"
  | "double"
  | "DECIMAL"
  | "decimal"
  // STRINGS
  | "CHAR"
  | "char"
  | "VARCHAR"
  | "varchar"
  | "TINYTEXT"
  | "tinytext"
  | "TEXT"
  | "text"
  | "MEDIUMTEXT"
  | "mediumtext"
  | "LONGTEXT"
  | "longtext"
  | "json"
  | "JSON"
  | "TINYBLOB"
  | "tinyblob"
  | "BLOB"
  | "blob"
  | "MEDIUMBLOB"
  | "mediumblob"
  | "LONGBLOB"
  | "longblob"
  // DATES
  | "DATE"
  | "date"
  | "TIME"
  | "time"
  | "YEAR"
  | "year"
  | "DATETIME"
  | "datetime"
  | "TIMESTAMP"
  | "timestamp"
  // DATES
  | "ENUM"
  | "enum"
  // RELATION
  | "RELATION"
  | "relation"

export type ConstraintType =
  | "CASCADE"
  | "cascade"
  | "SET NULL"
  | "set null"
  | "NO Action"
  | "no action"
  | "RESTRICT"
  | "restrict"
  | "SET DEFAULT"
  | "set default"

export type ColumnType = {
  name?: string
  type: SqlValueType
  size?: string | number
  nullable?: boolean
  unique?: boolean
  pk?: boolean
  fk?: boolean
  references?: string
  onDelete?: ConstraintType
  default?: StdNativeType
}
