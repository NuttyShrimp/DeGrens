import { Config } from '@dgx/server';
import { FastifyPluginAsync } from 'fastify';

export const businessRouter: FastifyPluginAsync = async server => {
  server.post<{ Body: { name: string; label: string; owner: number; typeName: string } }>(
    '/actions/new',
    async (req, res) => {
      await global.exports['dg-business'].createBusiness(
        req.body.name,
        req.body.label,
        Number(req.body.owner),
        req.body.typeName
      );
      return res.code(200).send({});
    }
  );

  server.get('/permissions', async (_, res) => {
    try {
      await Config.awaitConfigLoad();
      const perms = global.exports['dg-business'].getAllPermissions();
      return res.code(200).send(perms);
    } catch (e) {
      console.error(e);
      return res.code(500).send({
        error: 'kon de permissies niet ophalen uit het business resource',
      });
    }
  });

  server.delete<{ Params: { id: string } }>('/:id', (req, res) => {
    const id = req.params.id;
    if (!id || isNaN(Number(id))) {
      return res.code(500).send({
        error: 'business id is not a valid number',
      });
      return;
    }
    global.exports['dg-business'].deleteBusiness(id);
    return res.code(200).send({});
  });

  server.post<{ Body: { businessId: number; newOwner: number } }>('/updateOwner', (req, res) => {
    if (!req.body.businessId || !req.body.newOwner) {
      return res.code(500).send({
        error: 'missing data in request body',
      });
    }
    global.exports['dg-business'].updateOwner(req.body.businessId, req.body.newOwner);
    return res.code(200).send({});
  });
};
