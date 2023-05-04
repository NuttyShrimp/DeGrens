import { mainLogger } from '../sv_logger';
import { ModuleKey, startModule, stopModule } from '../moduleController';

RegisterCommand(
  'core:startModule',
  (source: number, args: string[]) => {
    if (!args[0]) {
      mainLogger.warn('No module name provided');
      return;
    }
    startModule(args[0] as ModuleKey);
  },
  true
);

RegisterCommand(
  'core:stopModule',
  (source: number, args: string[]) => {
    if (!args[0]) {
      mainLogger.warn('No module name provided');
      return;
    }
    stopModule(args[0] as ModuleKey);
  },
  true
);

RegisterCommand(
  'core:restartModule',
  (source: number, args: string[]) => {
    if (!args[0]) {
      mainLogger.warn('No module name provided');
      return;
    }
    stopModule(args[0] as ModuleKey);
    startModule(args[0] as ModuleKey);
  },
  true
);
