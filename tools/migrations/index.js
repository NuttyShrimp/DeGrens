import fs from 'fs';
import mysql from 'mysql2/promise';
import nst from 'node-sql-parser';
import path, { dirname } from 'path';
import { exit } from 'process';
import { fileURLToPath } from 'url';

let connectionOptions = null;
// Gotta love ES6 modules
const __dirname = dirname(fileURLToPath(import.meta.url));
const parser = new nst.Parser();

const getMigrVersionFromFile = file => {
  const vStr = file.split('_')[0];
  if (!vStr.match(/[vV]\d*/)) {
    throw new Error(`Could not determine migration version for ${file}`);
  }
  return parseInt(vStr.slice(1));
};

// Search for connection Str
const configDirPath = path.join(__dirname, '../../config');
let configFiles = fs.readdirSync(configDirPath);
if (configFiles.length < 1) {
  throw new Error(`Failed to find configs in ${configDirPath}`);
}
configFiles = configFiles.filter(f => !f.includes('-template'));
for (let file of configFiles) {
  const fileContent = fs.readFileSync(path.join(configDirPath, file)).toString().split(/\r?\n/);
  let connStr = fileContent.find(line => line.match(/^set\w? mysql_connection_string/));
  if (connStr) {
    connStr = connStr.replace(/set\w? mysql_connection_string "/, '').replace(/"$/, '');
    if (connStr.includes('mysql://')) {
      connectionOptions = {
        uri: connStr,
        multipleStatements: true,
      };
    } else {
      connectionOptions = connStr
        .replace(/(?:host(?:name)|ip|server|data\s?source|addr(?:ess)?)=/gi, 'host=')
        .replace(/(?:user\s?(?:id|name)?|uid)=/gi, 'user=')
        .replace(/(?:pwd|pass)=/gi, 'password=')
        .replace(/(?:db)=/gi, 'database=')
        .split(';')
        .reduce(
          (connectionInfo, parameter) => {
            const [key, value] = parameter.split('=');
            connectionInfo[key] = value;
            return connectionInfo;
          },
          {
            multipleStatements: true,
          }
        );
    }
    break;
  }
}
if (connectionOptions === null) {
  throw new Error(`Failed to find mysql_connection_string in files in ${configDirPath}`);
}

const conn = await mysql.createConnection(connectionOptions);

const [result] = await conn.query('SELECT version FROM migrations_tracker LIMIT 1');
const migrVersion = result?.[0]?.version ?? 1;

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
  exit(0)
}

let nextMigrVersion = migrVersion;
let shouldRollBack = false;
let migrFile = '';

try {
  for (migrFile of migrationFiles) {
    let queryPromises = [];
    const sqlOperations = fs.readFileSync(path.join(migrationDir, migrFile)).toString();
    const { ast } = parser.parse(sqlOperations);

    await conn.beginTransaction();
    shouldRollBack = true;

    // Add operations to transaction
    if (Array.isArray(ast)) {
      for (let op of ast) {
        queryPromises.push(conn.query(parser.sqlify(op)));
      }
      await Promise.all(queryPromises);
    } else {
      await conn.query(parser.sqlify(ast));
    }

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

conn.end();
