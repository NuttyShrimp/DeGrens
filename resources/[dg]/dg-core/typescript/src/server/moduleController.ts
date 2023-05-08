import { CharacterModule } from 'modules/characters/module.characters';
import { mainLogger } from 'sv_logger';
import { QueueModule } from './modules/queue/module.queue';
import { UserModule } from './modules/users/module.users';

// TODO: add module to inject module state
const modules = {
  queue: new QueueModule(),
  users: new UserModule(),
  characters: new CharacterModule(),
} satisfies Record<string, Modules.ServerModule>;

export type ModuleKey = keyof typeof modules;

export const startAllModules = () => {
  (Object.keys(modules) as ModuleKey[]).forEach(name => {
    startModule(name);
  });
  emit('core:modules:started');
};

export const stopAllModules = () => {
  Object.keys(modules).forEach(name => {
    stopModule(name as ModuleKey);
  });
};

export const startModule = (name: ModuleKey) => {
  if (!modules[name]) {
    mainLogger.warn(`Tried to start an unknown module: ${name}`);
    return;
  }
  const mod = modules[name];
  if ('onStart' in mod && typeof mod.onStart === 'function') {
    mainLogger.info(`Starting ${name} module`);
    mod.onStart();
    emit('core:module:started', name);
  }
};

export const stopModule = (name: ModuleKey) => {
  if (!modules[name]) {
    mainLogger.warn(`Tried to stop an unknown module: ${name}`);
    return;
  }
  const mod = modules[name];
  if ('onStop' in mod && typeof mod.onStop === 'function') {
    mainLogger.info(`Stopping ${name} module`);
    mod.onStop();
  }
};

export const getModule = <T extends ModuleKey>(name: T): (typeof modules)[T] => {
  return modules[name];
};

// Handlers
export const onPlayerJoining = (
  name: string,
  setKickReason: (reason: string) => void,
  deferrals: Record<string, any>
) => {
  Object.values(modules).forEach(mod => {
    if ('onPlayerJoining' in mod && typeof mod.onPlayerJoining === 'function') {
      mod.onPlayerJoining(+source, name, setKickReason, deferrals);
    }
  });
};

export const onPlayerJoined = (oldId: number) => {
  Object.values(modules).forEach(mod => {
    if ('onPlayerJoined' in mod && typeof mod.onPlayerJoined === 'function') {
      mod.onPlayerJoined(+source, oldId);
    }
  });
};

export const onPlayerDropped = (reason: string) => {
  Object.values(modules).forEach(mod => {
    if ('onPlayerDropped' in mod && typeof mod.onPlayerDropped === 'function') {
      mod.onPlayerDropped(+source, reason);
    }
  });
};
