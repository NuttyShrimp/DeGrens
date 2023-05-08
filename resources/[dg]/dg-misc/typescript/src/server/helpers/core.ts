import { Core } from '@dgx/server';

export let charModule = Core.getModule('characters');

on('core:module:started', (moduleName: string) => {
  if (moduleName === 'characters') {
    charModule = Core.getModule('characters');
  }
});
