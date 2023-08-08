import { FastifyPluginAsync } from 'fastify';
import { actionRouter } from './actions';
import { reportRouter } from './report';

export const adminRouter: FastifyPluginAsync = async server => {
  server.register(actionRouter, { prefix: '/actions' });
  server.register(reportRouter, { prefix: '/report' });
};
