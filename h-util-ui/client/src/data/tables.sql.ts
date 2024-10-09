/**
 * Queries for setting up the tables
 */
export const tablesSql: string[] = [
    `--sql
  CREATE TABLE IF NOT EXISTS Pipeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME DEFAULT CURRENT_TIMESTAMP,
    color TEXT,
    manual_ranking INTEGER DEFAULT 100
  );
  `,
    `--sql
  CREATE TABLE IF NOT EXISTS Module (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE,
    data TEXT NOT NULL
  );`,
    `--sql
  CREATE TABLE IF NOT EXISTS PipelineModule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pipeline_id INTEGER NOT NULL,
    module_id INTEGER NOT NULL,
    FOREIGN KEY (pipeline_id) REFERENCES Pipeline(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES Module(id) ON DELETE RESTRICT,
    UNIQUE (pipeline_id, module_id)
  );`,
    `--sql
  CREATE TABLE IF NOT EXISTS Stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    value INTEGER NOT NULL
  );`,
    `--sql
  CREATE TABLE IF NOT EXISTS Events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    event_name TEXT NOT NULL,
    data TEXT NOT NULL
  );
  `,
    `--sql
  CREATE TABLE IF NOT EXISTS PipelineStats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pipeline_id INTEGER NOT NULL UNIQUE,
    times_ran INTEGER DEFAULT 0,
    time_taken INTEGER DEFAULT 0,
    bytes_compressed INTEGER DEFAULT 0,
    words_parsed INTEGER DEFAULT 0,
    files_processed INTEGER DEFAULT 0,
    FOREIGN KEY (pipeline_id) REFERENCES Pipeline(id) ON DELETE CASCADE
  );`,
    `--sql
  CREATE TABLE IF NOT EXISTS Aqueduct (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE,
    pipeline_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    directories TEXT NOT NULL,
    FOREIGN KEY (pipeline_id) REFERENCES Pipeline(id) ON DELETE CASCADE
  );`,
    `--sql
  CREATE TABLE IF NOT EXISTS Migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,
];
