let blackout_active = false;

const setBlackout = (blackout: boolean) => {
  blackout_active = blackout;
  console.log(`^2[WEATHER] ^7Blackout is ${blackout_active ? '^1ENABLED' : '^2DISABLED'}`);
  emitNet('dg-weathersync:client:blackout', -1, blackout);
};

onNet('dg-weathersync:server:toggleBlackout', () => {
  global.exports['dg-logs'].createGraylogEntry(
    'weathersync:blackout',
    {
      blackout: !blackout_active,
      source: source,
    },
    `${GetPlayerName(String(source))} toggled the blackout via the event.`
  );
  setBlackout(!blackout_active);
});

RegisterCommand(
  'blackout',
  source => {
    if (source !== 0) {
      global.exports['dg-logs'].createGraylogEntry(
        'weathersync:blackout',
        {
          blackout: !blackout_active,
          source: source,
        },
        `${GetPlayerName(source)} used the blackout command.`
      );
    }
    setBlackout(!blackout_active);
  },
  true
);

global.exports('blackout', setBlackout);
