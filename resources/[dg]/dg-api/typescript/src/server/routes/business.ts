import { Config } from "@dgx/server";
import { registerRoute } from "sv_routes";

registerRoute("GET", "/business/permissions", async (_, res) => {
  try {
    await Config.awaitConfigLoad();
    const perms = global.exports['dg-business'].getAllPermissions();
    res(200, perms)
  } catch (e) {
    console.error(e)
    res(500, {
      error: "kon de permissies niet ophalen uit het business resource"
    })
  }
})

registerRoute("DELETE", "/business/:id", (req, res) => {
  const id = req.params.id;
  if (!id || isNaN(Number(id))) {
    res(500, {
      error: "business id is not a valid number"
    })
    return
  }
  global.exports['dg-business'].deleteBusiness(id)
  res(200, {})
})

registerRoute("POST", "/business/updateOwner", (req, res) => {
  if (!req.body.businessId || !req.body.newOwner) {
    res(500, {
      error: "missing data in request body"
    })
    return
  }
  global.exports['dg-business'].updateOwner(req.body.businessId, req.body.newOwner);
  res(200, {})
})
