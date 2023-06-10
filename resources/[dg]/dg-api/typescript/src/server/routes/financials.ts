import { Financials, Util } from '@dgx/server';
import { tokenManager } from 'classes/tokenManager';
import { registerRoute } from 'sv_routes';

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

registerRoute('POST', '/financials/giveFine', (req, res) => {
  if (!req.body.cid || !req.body.price || !req.body.origin) {
    return res(400, { error: 'missing info' });
  }
  try {
    const cid = parseInt(req.body.cid);
    const price = parseFloat(req.body.price);
    Util.Log(
      'api:financials:giveFine',
      {
        data: req.body,
        origin: req.address,
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
    return res(200, {});
  } catch (e) {
    console.error(e);
    Util.Log(
      'api:financials:giveFine:failed',
      {
        data: req.body,
        origin: req.address,
        usedToken: tokenManager.getTokenId(req),
        error: e,
      },
      `Failed to give someone a fine via the API`
    );
    res(500, {
      error: 'er is iets fout gelopen tijdens het verwerken van je fine, kloppen alle velden?',
    });
  }
});

registerRoute('PATCH', '/financials/updateBalance', (req, res) => {
  if (!req.body.accountId || req.body.balance === undefined) {
    return res(400, { error: 'missing info' });
  }

  Financials.setAccountBalance(req.body.accountId, req.body.balance);

  res(200, {});
});
