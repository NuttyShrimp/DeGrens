import { Core } from '@dgx/server';

export let userModule = Core.getModule('users');

on('core:module:started', (moduleName: string) => {
  if (moduleName === 'users') {
    userModule = Core.getModule('users');
  }
});
