import { Financials, SQL } from "@dgx/server";
import { registerRoute } from "sv_routes";

const infoEndpoints = [
  {
    name: "data",
    query: `
        SELECT steamid as steamId, citizenid as cid, firstname, lastname, metadata, UNIX_TIMESTAMP(last_updated) AS last_updated, UNIX_TIMESTAMP(created_at) AS created_at, birthdate, gender, nationality, phone, cash, cr.crafting, cr.ammo_crafting, cr.mechanic_crafting
        FROM all_character_data
          LEFT JOIN character_reputations AS cr USING (citizenid)
        WHERE citizenid = ?
        ORDER BY citizenid
    `,
    transformer: (data:any) => {
      data = data[0];
      data.reputation = {
        crafting: data.crafting ?? 0,
        ammo_crafting: data.ammo_crafting ?? 0,
        mechanic_crafting: data.mechanic_crafting ?? 0,
      }
      data.metadata = JSON.parse(data.metadata);
      delete data.crafting;
      delete data.ammo_crafting;
      delete data.mechanic_crafting;
      return data
    }
  },
  {
    name: 'bank',
    query: `SELECT account_id, name, type, balance, access_level FROM bank_accounts LEFT JOIN bank_accounts_access USING (account_id) WHERE cid=?`,
    transformer: (data: any) => {
      return data.map((b:any) => {
        const perms = Financials.buildPermissions(b.access_level);
        delete b.access_level;
        return { ...b, permissions: perms }
      })
    },
  },
  {
    name: "vehicles",
    query: `SELECT vin, model, plate, fakeplate, state, garageId from player_vehicles WHERE cid = ?`,
  }
]

// Returns a list with all cids
registerRoute("GET", "/info/characters", async (req, res) => {
  try {
    const info = await SQL.query(`
      SELECT steamid as steamId, citizenid as cid, firstname, lastname
      FROM characters
      LEFT JOIN character_info ci USING(citizenid)
      ORDER BY citizenid
    `);
    res(200, info);
  } catch (e) {
    res(500, {
      message: 'Failed to retrieve all players information',
    });
  }
});

setImmediate(() => {
  infoEndpoints.forEach(e => {
    registerRoute("GET", `/info/characters/${e.name}/:cid`, async (req, res) => {
      const cid = req.params.cid;
      if (!cid) {
        res(400, {
          message: "No citizenid given"
        })
        return
      }
      if (Number.isNaN(parseInt(cid))) {
        res(400, {
          message: "Invalid citizenid given"
        })
        return
      }
      try {
        let info = await SQL.query(e.query, [parseInt(cid)]);
        if (!info) {
          res(500, null);
        }
        if (e.transformer) {
          info = e.transformer(info);
        }
        res(200, info);
      } catch (e: any) {
        console.error(e)
        res(500, {
          message: `Failed to retrieve all characters ${e.name} information`,
        });
      }
    });
  })
})
