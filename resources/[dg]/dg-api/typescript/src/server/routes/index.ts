import './info';
import './token';
import './financials';
import './business';
import './admin';
import './info/character';
import { server } from 'sv_router';

server.get('/', (_, res) => {
  res.code(200).send({
    host: ExecuteCommand('sv_projectName'),
  });
});

server.post<{ Body: { model: string; owner: number } }>('/vehicles/give', async (req, res) => {
  await global.exports['dg-vehicles'].giveNewVehicle(req.body.model, Number(req.body.owner));
  res.code(200).send({
    result: true,
  });
});
