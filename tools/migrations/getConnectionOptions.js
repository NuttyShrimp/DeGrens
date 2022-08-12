import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const getConnectionOptions = () => {
  let connectionOptions = null;
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
  return connectionOptions;
};
