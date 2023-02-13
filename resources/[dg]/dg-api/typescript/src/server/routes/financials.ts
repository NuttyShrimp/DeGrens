import { Financials, Util } from "@dgx/server";
import { tokenManager } from "classes/tokenManager";
import { registerRoute } from "sv_routes";

const fineReasons: Record<string, string> = {
  "police": "Boete",
  "ambulance": "Ziekte kosten"
}

const originToNames: Record<string, string> = {
  "police": "Politiekorps DG",
  "ambulance": "AZDG"
}

registerRoute("POST", "/financials/giveFine", (req, res) => {
  if (!req.body.cid || !req.body.price || !req.body.origin) {
    return res(400, { error: "missing info" })
  }
  try {
    const cid = parseInt(req.body.cid);
    const price = parseFloat(req.body.price);
    Util.Log("api:financials:giveFine", {
      data: req.body, origin: req.address, usedToken: tokenManager.getTokenId(req)
    }, `someone gave ${cid} a fine via the API endpoint`);
    Financials.giveFine(cid, 'BE2', price, fineReasons[req.body.origin] ?? "Onbekende reden (meld aan devs)", originToNames[req.body.origin] ?? "Ongekend")
    return res(200, {});
  } catch (e) {
    console.error(e);
    Util.Log("api:financials:giveFine:failed", {
      data: req.body, origin: req.address, usedToken: tokenManager.getTokenId(req), error: e
    }, `Failed to give someone a fine via the API`)
    res(500, {
      error: "er is iets fout gelopen tijdens het verwerken van je fine, kloppen alle velden?"
    })
  }
})
