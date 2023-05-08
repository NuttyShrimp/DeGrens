import { CharacterModule } from 'modules/characters/module.characters';

// TODO: add module to inject module state
const modules = {
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
    console.warn(`Tried to start an unknown module: ${name}`);
    return;
  }
  const mod = modules[name];
  if ('onStart' in mod && typeof mod.onStart === 'function') {
    console.info(`Starting ${name} module`);
    mod.onStart();
    emit('core:module:started', name);
  }
};

export const stopModule = (name: ModuleKey) => {
  if (!modules[name]) {
    console.warn(`Tried to stop an unknown module: ${name}`);
    return;
  }
  const mod = modules[name];
  if ('onStop' in mod && typeof mod.onStop === 'function') {
    console.info(`Stopping ${name} module`);
    mod.onStop();
  }
};

export const getModule = <T extends ModuleKey>(name: T): (typeof modules)[T] => {
  return modules[name];
};
