import { Core } from '@dgx/server';

export let charModule = Core.getModule('characters');

Core.onModuleStarted('characters', () => {
  charModule = Core.getModule('characters');
});
