import { Inventory, Util } from '@dgx/server';
import { tokenManager } from 'classes/tokenManager';
import { FastifyPluginAsync } from 'fastify';

export const itemRouter: FastifyPluginAsync = async server => {
  server.delete<{ Params: { itemId: string } }>('/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    Inventory.destroyItem(itemId);
    Util.Log(
      'api:inventory:item:remove',
      {
        itemId,
        usedToken: tokenManager.getTokenId(req),
      },
      `Deleted ${itemId} via API`
    );
    return res.code(200).send({});
  });
};
