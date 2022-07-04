import fs, { lstatSync } from 'fs';
import * as path from 'path';
import { mainLogger } from 'sv_logger';

const root = `${GetResourcePath(GetCurrentResourceName())}/configs`;
const configs: Map<String, Record<string, any>> = new Map();
let configsLoaded = false;

export const areConfigsLoaded = () => configsLoaded;

const loadConfigsFromDir = (dir: string) => {
  const folderPath = path.join(root, dir);
  const fileNames = fs
    .readdirSync(folderPath, { encoding: 'utf-8' })
    .filter(d => lstatSync(path.join(folderPath, d)).isFile());
  for (const fileName of fileNames) {
    try {
      const data = fs.readFileSync(`${folderPath}/${fileName}`, 'utf-8');
      const parsedData = JSON.parse(data);
      const moduleId = fileName.replace('.json', '');
      if (configs.has(moduleId)) {
        mainLogger.error(`${moduleId} config was already set, overwriting...`);
      }
      if (dir === '.') {
        configs.set(moduleId, parsedData);
        emit('dg-config:moduleLoaded', moduleId, parsedData);
      } else {
        const realModule = dir.replace(/\//g, '');
        let existingConfig = configs.get(realModule);
        if (!existingConfig) {
          existingConfig = {};
        }
        existingConfig[moduleId] = parsedData;
        configs.set(realModule, existingConfig);
        emit('dg-config:moduleLoaded', `${realModule}.${moduleId}`, parsedData);
      }
    } catch (e) {
      setInterval(() => {
        mainLogger.error('Failed to load configs', e);
      }, 1000);
      return;
    }
  }
};

export const loadConfigs = () => {
  // Use sync variants because thread affinity residentsleeper
  // Load single files in config folder
  loadConfigsFromDir('.');

  // Load files in subfolders
  const subfolders = fs
    .readdirSync(root, { encoding: 'utf-8' })
    .filter(d => lstatSync(path.join(root, d)).isDirectory());
  for (const subfolder of subfolders) {
    loadConfigsFromDir(`/${subfolder}`);
  }

  mainLogger.info(`Successfully loaded ${configs.size} config modules`);
  configsLoaded = true;
};

export const getConfigForModule = (moduleId: string) => {
  if (!configs.has(moduleId)) {
    mainLogger.warn(`${GetInvokingResource()} tried to get a config for an unkown module: ${moduleId}`);
    return null;
  }
  return configs.get(moduleId);
};

// To easily get a config value if you dont want to get the whole config
export const getConfigValue = (path: string): any => {
  if (!configsLoaded) return;
  const steps = path.split('.');
  const moduleId = steps.shift();
  if (!configs.has(moduleId)) {
    mainLogger.warn(
      `${GetInvokingResource()} tried to access a invalid module: ${moduleId} via following path: ${path}`
    );
    return null;
  }
  let currentValue = configs.get(moduleId);
  while (steps.length !== 0) {
    const key = steps.shift();
    if (currentValue?.[key] === undefined) {
      mainLogger.error(`${key} is an invalid key in the ${moduleId} module, path: ${path}`);
      break;
    }
    currentValue = currentValue[key];
  }
  return currentValue;
};
