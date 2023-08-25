import { Inventory, Util } from '@dgx/server';
import { tokenManager } from 'classes/tokenManager';
import { FastifyPluginAsync } from 'fastify';

export const itemRouter: FastifyPluginAsync = async server => {
  server.delete<{ Params: { itemId: string } }>('/:itemId', async (req, res) => {
    const itemId = req.params.itemId;
    const itemState = await Inventory.getItemStateFromDatabase(itemId);
    if (!itemState) {
      throw new Error(`Failed to get item state for item with id: ${itemId}`);
    }
    const { type, identifier } = Inventory.splitId(itemState.inventory);
    await Inventory.getItemsInInventory(type, identifier);
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
