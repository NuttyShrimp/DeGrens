import { areConfigsLoaded, getConfigForModule, getConfigValue } from "services/configs";

global.exports('areConfigsReady', () => areConfigsLoaded())
global.exports('getModuleConfig', (moduleId: string) => getConfigForModule(moduleId))
global.exports('getConfigValue', (path: string) => getConfigValue(path))
