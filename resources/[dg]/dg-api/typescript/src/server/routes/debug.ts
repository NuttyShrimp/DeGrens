import { DGXAuth } from '@dgx/server';
import { FastifyPluginAsync } from 'fastify';
import { extractBearerToken } from 'middlewares/helpers';

export const debugRouter: FastifyPluginAsync = async server => {
  server.get(
    '/events',
    {
      websocket: true,
      preValidation: (req, res, done) => {
        const token = extractBearerToken(req, res);
        if (!token) {
          throw res.unauthorized('Missing authorization token');
        }
        const valid = DGXAuth.isEventDebugTokenValid(token);
        if (!valid) {
          throw res.forbidden('Invalid authorization token');
        }
        done();
      },
    },
    (conn, _req) => {
      const eventSubscriber = (events: any[]) => {
        conn.socket.send(JSON.stringify(events));
      };
      const subId = DGXAuth.subscribeToEvents(eventSubscriber);
      conn.socket.on('close', () => {
        DGXAuth.removeSubscriber(subId);
      });
    }
  );
};
