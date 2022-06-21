
import fs from 'fs';
import { mainLogger } from 'sv_logger';

const root = `${GetResourcePath(GetCurrentResourceName())}/configs`
const configs: Map<String, Record<string, any>> = new Map();
let configsLoaded = false;

export const areConfigsLoaded = () => configsLoaded;

export const loadConfigs = () => {
  // Use sync variants because thread affinity residentsleeper
  const fileNames = fs.readdirSync(root, {encoding: 'utf-8'});
  for (let fileName of fileNames) {
    try {
      const data = fs.readFileSync(`${root}/${fileName}`, 'utf-8')
      const parsedData = JSON.parse(data);
      const moduleId = fileName.replace('.json', '')
      if (configs.has(moduleId)) {
        mainLogger.error(`${moduleId} config was already set, overwriting...`)
      }
      configs.set(moduleId, parsedData)
      emit("dg-config:moduleLoaded", moduleId, parsedData)
    } catch (e) {
      setInterval(() => {
        mainLogger.error("Failed to load configs", e)
      }, 1000)
      return;
    }
  }
  mainLogger.info(`Successfully loaded ${fileNames.length} configs`)
  configsLoaded = true;
}

export const getConfigForModule = (moduleId: string) => {
  if (!configs.has(moduleId)) {
    mainLogger.warn(`${GetInvokingResource()} tried to get a config for an unkown module: ${moduleId}`)
    return null;
  }
  return configs.get(moduleId)
}

// To easily get a config value if you dont want to get the whole config
export const getConfigValue = (path: string): any => {
  if (!configsLoaded) return;
  const steps = path.split('.');
  const moduleId = steps.shift();
  if (!configs.has(moduleId)) {
    mainLogger.warn(`${GetInvokingResource()} tried to access a invalid module: ${moduleId} via following path: ${path}`)
    return null;
  }
  let currentValue = configs.get(moduleId);
  while (steps.length !== 0) {
    const key = steps.shift();
    if (!currentValue?.[key]) {
      mainLogger.error(`${key} is an invalid key in the ${moduleId} module, path: ${path}`)
      break
    }
    currentValue = currentValue[key]
  }
  return currentValue;
}
