import { Financials, Util } from '@dgx/server';
import { tokenManager } from 'classes/tokenManager';
import { FastifyPluginAsync } from 'fastify';

const originInfo: Record<string, { name: string; reason: string; accountId: string }> = {
  police: {
    name: 'Politiekorps DG',
    reason: 'Boete',
    accountId: 'BE2',
  },
  ambulance: {
    name: 'AZDG',
    reason: 'Ziekte kosten',
    accountId: 'BE3',
  },
};

export const financialsRouter: FastifyPluginAsync = async server => {
  server.post<{ Body: { cid: string; price: string; origin: string } }>('/giveFine', (req, res) => {
    if (!req.body.cid || !req.body.price || !req.body.origin) {
      return res.code(400).send({ error: 'missing info' });
    }
    try {
      const cid = parseInt(req.body.cid);
      const price = parseFloat(req.body.price);
      Util.Log(
        'api:financials:giveFine',
        {
          data: req.body,
          origin: req.ip,
          usedToken: tokenManager.getTokenId(req),
        },
        `someone gave ${cid} a fine via the API endpoint`
      );
      Financials.giveFine(
        cid,
        originInfo[req.body.origin]?.accountId ?? 'BE2',
        price,
        originInfo[req.body.origin]?.reason ?? 'Onbekende reden (meld aan devs)',
        originInfo[req.body.origin]?.name ?? 'Ongekend'
      );
      return res.code(200).send({});
    } catch (e) {
      console.error(e);
      Util.Log(
        'api:financials:giveFine:failed',
        {
          data: req.body,
          origin: req.ip,
          usedToken: tokenManager.getTokenId(req),
          error: e,
        },
        `Failed to give someone a fine via the API`
      );
      return res.code(500).send({
        error: 'er is iets fout gelopen tijdens het verwerken van je fine, kloppen alle velden?',
      });
    }
  });

  server.patch<{ Body: { accountId: string; balance: number } }>('/updateBalance', (req, res) => {
    if (!req.body.accountId || req.body.balance === undefined) {
      return res.code(400).send({ error: 'missing info' });
    }

    Financials.setAccountBalance(req.body.accountId, req.body.balance);

    return res.code(200).send({});
  });
};
