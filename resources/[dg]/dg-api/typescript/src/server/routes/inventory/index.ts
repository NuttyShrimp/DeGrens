import { FastifyPluginAsync } from 'fastify';
import { itemRouter } from './items';

export const inventoryRouter: FastifyPluginAsync = async server => {
  server.register(itemRouter, { prefix: '/item' });
};
