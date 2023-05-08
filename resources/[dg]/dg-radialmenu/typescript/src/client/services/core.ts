import { Core } from '@dgx/client';

export let charModule: Core.ClientModules.CharacterModule;

on('core:module:started', (moduleName: string) => {
  if (moduleName === 'characters') {
    charModule = Core.getModule('characters');
  }
});
