import fs, { lstatSync } from 'fs';
import * as path from 'path';
import { mainLogger } from 'sv_logger';

const root = `${GetResourcePath(GetCurrentResourceName())}/configs`;
const configs: Record<string, any> = {};
let configsLoaded = false;

export const areConfigsLoaded = () => configsLoaded;

const loadConfigsFromDir = (dir: string = '') => {
  const folderPath = path.join(root, dir);
  const dirContent = fs.readdirSync(folderPath, { encoding: 'utf-8' });

  // first split all dir content in file and subfolders
  const fileNames: string[] = [];
  const subfolders: string[] = [];
  for (const d of dirContent) {
    const stat = lstatSync(path.join(folderPath, d));
    if (stat.isFile()) {
      fileNames.push(d);
    } else if (stat.isDirectory()) {
      subfolders.push(d);
    }
  }

  // get ref to parent object of module
  let parentModule = configs;
  for (const moduleId of dir.split('/')) {
    if (moduleId === '') continue;
    parentModule = parentModule[moduleId] ??= {};
  }

  // fill parentmodule
  for (const fileName of fileNames) {
    try {
      const data = fs.readFileSync(`${folderPath}/${fileName}`, 'utf-8');
      const parsedData = JSON.parse(data);

      const moduleId = fileName.replace('.json', '');
      if (moduleId in parentModule) {
        mainLogger.error(`${moduleId} config was already set, overwriting...`);
      }

      parentModule[moduleId] = parsedData;

      const parentModuleId = dir.substring(dir.startsWith('/') ? 1 : 0).replace('/', '.');
      const fullModule = [parentModuleId, moduleId].filter(m => m !== '').join('.');
      emit('dg-config:moduleLoaded', fullModule, parsedData);
    } catch (e) {
      setInterval(() => {
        mainLogger.error('Failed to load configs', e);
      }, 1000);
      return;
    }
  }

  // recursive loading of folder
  for (const subfolder of subfolders) {
    loadConfigsFromDir(`${dir}/${subfolder}`);
  }

  if (fileNames.length > 0) {
    const parentModuleId = dir.substring(dir.startsWith('/') ? 1 : 0).replace('/', '.');
    if (parentModuleId !== '') {
      emit('dg-config:moduleLoaded', parentModuleId, parentModule);
    }
  }
};

export const loadConfigs = () => {
  // Use sync variants because thread affinity residentsleeper
  loadConfigsFromDir();

  mainLogger.info(`Successfully loaded ${Object.keys(configs).length} config modules`);
  configsLoaded = true;
};

export const getConfigForModule = (moduleId: string) => {
  if (!configsLoaded) return;
  if (!(moduleId in configs)) {
    mainLogger.warn(`${GetInvokingResource()} tried to get a config for an unkown module: ${moduleId}`);
    return null;
  }
  return configs[moduleId];
};

// To easily get a config value if you dont want to get the whole config
export const getConfigValue = (path: string): any => {
  if (!configsLoaded) return;
  const moduleIds = path.split('.');
  let module = configs;
  for (const moduleId of moduleIds) {
    if (!moduleId || !(moduleId in module)) {
      mainLogger.error(`${moduleId} is an invalid moduleId, path: ${path}`);
      break;
    }
    module = module[moduleId];
  }
  return module;
};
