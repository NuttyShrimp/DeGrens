import { Config, Events } from '@dgx/server';
import { setPrivateToken } from 'helpers/privateToken';
import { addStartedResource, createList } from 'helpers/resources';
import { cleanupPlayer, removeResourceToken } from 'services/eventTokens';
import { generatePanelToken, setPanelEndpoint } from 'services/panelTokens';

setImmediate(async () => {
  createList();
  await Config.awaitConfigLoad();
  setPrivateToken(Config.getConfigValue('auth.private_key'));
  setPanelEndpoint(Config.getConfigValue('main.panelEndpoint'));
});

on('onResourceStart', (resName: string) => {
  addStartedResource(resName);
  removeResourceToken(resName);
});

on('playerJoining', () => {
  const src = +source;
  cleanupPlayer(src);
});

on('dg-config:moduleLoaded', (name: string, data: { private_key: string; panelEndpoint: string }) => {
  if (name === 'auth') {
    setPrivateToken(data.private_key);
  }
  if (name === 'main') {
    setPanelEndpoint(data.panelEndpoint);
  }
});

Events.onNet('auth:panel:reconnect', src => {
  generatePanelToken(src);
});

on('playerDropped', () => {
  const src = +source;
  cleanupPlayer(src);
});
