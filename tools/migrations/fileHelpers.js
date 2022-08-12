import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const getMigrVersionFromFile = file => {
  const vStr = file.split('_')[0];
  if (!vStr.match(/[vV]\d*/)) {
    throw new Error(`Could not determine migration version for ${file}`);
  }
  return parseInt(vStr.slice(1));
};

export const validateFiles = () => {
  const migrationDir = path.join(__dirname, '../../migrations');
  let migrationFiles = fs.readdirSync(migrationDir);
  for (let file of migrationFiles) {
    if (!file.match(/^[vV]\d+([_-][^\s]*).sql$/)) {
      throw new Error(`${file} does not meet the format: (v|V)2_info_about_migr.sql`);
    }
  }
};
