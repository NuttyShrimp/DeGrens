export const toggleBlackout: CommandData = {
  name: 'toggleBlackout',
  log: 'has toggled blackout',
  role: 'developer',
  target: false,
  isClientCommand: false,
  handler: () => {
    global.exports['dg-blackout'].toggleBlackout();
  },
  UI: {
    title: 'Toggle Blackout',
    oneTime: true,
  },
};
