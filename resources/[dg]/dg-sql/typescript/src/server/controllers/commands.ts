import poolManager from 'classes/poolManager';

RegisterCommand(
  'sql:reconnect',
  () => {
    poolManager.reconnect();
  },
  true
);
