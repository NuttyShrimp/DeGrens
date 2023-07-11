setImmediate(() => {
  SetConvarServerInfo('sv_connectedCount', String(GetNumPlayerIndices()));
});

on('playerJoining', () => {
  SetConvarServerInfo('sv_connectedCount', String(GetNumPlayerIndices()));
});

on('playerLeft', () => {
  SetConvarServerInfo('sv_connectedCount', String(GetNumPlayerIndices()));
});
