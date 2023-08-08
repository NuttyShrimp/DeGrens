import { Admin } from '@dgx/server';
import { FastifyPluginAsync } from 'fastify';
import { validateBody } from 'helpers/bodyHelper';

export const actionRouter: FastifyPluginAsync = async server => {
  server.post<{ Body: { target: string; points: number; reason: string } }>('/warn', async (req, res) => {
    if (!req.body.target) {
      return res.code(400).send({
        message: 'No target given to warn',
      });
    }
    if (req.body.points === undefined || Number.isNaN(Number(req.body.points)) || Number(req.body.points) < 0) {
      return res.code(400).send({
        message: 'points must be valid number that is positive or 0',
      });
    }
    await Admin.warn(0, req.body.target, [req.body.reason], req.body.points);
    return res.code(200).send({
      result: true,
    });
  });

  server.post<{ Body: { target: string; reason: string; points: number } }>('/kick', async (req, res) => {
    if (!req.body.target) {
      return res.code(400).send({
        message: 'No target given to kick',
      });
    }
    if (!req.body.reason || !String(req.body.reason) || req.body.reason.trim() === '') {
      return res.code(400).send({
        message: 'reason must be valid string and cannot be empty',
      });
    }
    if (req.body.points === undefined || Number.isNaN(Number(req.body.points)) || Number(req.body.points) < 0) {
      return res.code(400).send({
        message: 'points must be valid number that is positive or 0',
      });
    }
    await Admin.kick(0, req.body.target, [req.body.reason], req.body.points);
    return res.code(200).send({
      result: true,
    });
  });

  server.post<{ Body: { target: string; reason: string; points: number; length: number } }>(
    '/ban',
    async (req, res) => {
      if (!validateBody(res, req.body, ['target', 'length', 'reason', 'points'])) {
        return res;
      }
      if (!req.body.target) {
        return res.code(400).send({
          message: 'No target given to ban',
        });
      }
      if (!req.body.reason || !String(req.body.reason) || req.body.reason.trim() === '') {
        return res.code(400).send({
          message: 'reason must be a valid string and cannot be empty',
        });
      }
      if (Number.isNaN(Number(req.body.points)) || Number(req.body.points) < 0) {
        return res.code(400).send({
          message: 'points must be a valid number that is positive or 0',
        });
      }
      if (Number.isNaN(Number(req.body.length)) || Number(req.body.length) < -1 || Number(req.body.length) === 0) {
        return res.code(400).send({
          message: 'length must be a valid number that is positive or -1',
        });
      }
      await Admin.ban(0, req.body.target, [req.body.reason], req.body.points, req.body.length);
      return res.code(200).send({
        result: true,
      });
    }
  );
};
