import { getCmdState } from 'modules/commands/state.commands';

global.exports('inNoclip', () => {
  return getCmdState('noclip');
});

global.exports('inCloak', () => {
  return getCmdState('cloak');
});
