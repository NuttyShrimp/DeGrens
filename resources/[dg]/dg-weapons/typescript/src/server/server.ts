import { Config } from '@dgx/server';
import { loadConfig } from 'services/config';
import './controllers/events';

setImmediate(async () => {
  await Config.awaitConfigLoad();
  loadConfig();
});
