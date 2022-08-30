import fs from 'fs';
import mysql from 'mysql2/promise';
import path, { dirname } from 'path';
import { exit } from 'process';
import { fileURLToPath } from 'url';

import { getMigrVersionFromFile, validateFiles } from './fileHelpers.js';
import { getConnectionOptions } from './getConnectionOptions.js';

const shouldInitDB = process.argv.slice(2).includes('--init-db');

// Gotta love ES6 modules
const __dirname = dirname(fileURLToPath(import.meta.url));

let connectionOptions = getConnectionOptions();

validateFiles();

const conn = await mysql.createConnection(connectionOptions);

let migrVersion = shouldInitDB ? 0 : 1;
if (!shouldInitDB) {
  const [result] = await conn.query('SELECT version FROM migrations_tracker LIMIT 1');
  migrVersion = result?.[0]?.version ?? 1;
}
// Searching in migrations directory for files greater than db version
const migrationDir = path.join(__dirname, '../../migrations');
let migrationFiles = fs.readdirSync(migrationDir);
// Filter files to only include interesting ones
migrationFiles = migrationFiles.filter(file => {
  const fileVersion = getMigrVersionFromFile(file);
  return fileVersion > migrVersion;
});

if (migrationFiles.length < 1) {
  console.log('Migrations are already up-to-date');
  exit(0);
}

let nextMigrVersion = migrVersion;
let shouldRollBack = false;
let migrFile = '';

try {
  for (migrFile of migrationFiles) {
    let queryPromises = [];
    const sqlOperations = fs.readFileSync(path.join(migrationDir, migrFile)).toString();

    await conn.beginTransaction();
    shouldRollBack = true;
    const queries = sqlOperations
      .split(';')
      .map(op => op.replaceAll(/#.*\r?\n/g, ''))
      .map(op => op.replaceAll(/\r?\n/g, ''))
      .filter(op => op && op !== '');
    
    // Add operations to transaction
    for (let op of queries) {
      queryPromises.push(conn.query(op));
    }
    await Promise.all(queryPromises);

    await conn.commit();
    shouldRollBack = false;
    console.log(`Finished ${path.basename(migrFile)}`);
    nextMigrVersion = getMigrVersionFromFile(migrFile);
  }
} catch (e) {
  if (shouldRollBack) {
    await conn.rollback();
  }
  console.error(e);
  throw new Error(`Migration failed in file ${path.basename(migrFile)} with error: ${e.message}`);
} finally {
  conn.query('UPDATE migrations_tracker SET version = ?', [nextMigrVersion]);
}

console.log(`Finished migrations: V${migrVersion} -> V${nextMigrVersion}`);

conn.end();
