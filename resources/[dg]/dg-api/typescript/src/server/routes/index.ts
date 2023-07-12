import { registerRoute } from 'sv_routes';
import './info';
import './token';
import './financials';
import './business';
import './admin';
import './info/character';

registerRoute('GET', '/', (_, res) => {
  res(200, {
    host: ExecuteCommand('sv_projectName'),
  });
});

registerRoute('POST', '/post-test', (req, res) => {
  console.log('POST PONG', req.body);
  res(200, {});
});
