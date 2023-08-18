import { Admin, Events } from '@dgx/server';
import { FastifyPluginAsync } from 'fastify';

export const reportRouter: FastifyPluginAsync = async server => {
  server.post<{ Body: { id: number; receivers: string[] } }>('/announce', async (req, res) => {
    if (!req.body.id) {
      return res.code(400).send({
        message: 'missing report id in body',
      });
    }
    const targets = Admin.plyInDevMode();
    targets.forEach(t => {
      Events.emitNet('auth:panel:announceNewReportMessage', t, req.body.id);
    });
    if (req.body.receivers && Array.isArray(req.body.receivers)) {
      req.body.receivers.forEach(async recv => {
        const serverId = await global.exports['dg-auth'].getServerIdForSteamId(recv);
        if (!serverId) return;
        Events.emitNet('auth:panel:announceNewReportMessage', serverId, req.body.id);
      });
    }
    return res.code(200).send({});
  });
};
