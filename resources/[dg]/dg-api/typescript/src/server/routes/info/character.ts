import { Financials, SQL } from '@dgx/server';
import { FastifyPluginAsync } from 'fastify';

const infoEndpoints = [
  {
    name: 'data',
    query: `
        SELECT steamid as steamId, citizenid as cid, firstname, lastname, metadata, UNIX_TIMESTAMP(last_updated) AS last_updated, UNIX_TIMESTAMP(created_at) AS created_at, birthdate, gender, nationality, phone, cash, cr.crafting, cr.ammo_crafting, cr.mechanic_crafting
        FROM all_character_data
          LEFT JOIN character_reputations AS cr USING (citizenid)
        WHERE citizenid = ?
        ORDER BY citizenid
    `,
    transformer: (data: any) => {
      data = data[0];
      data.reputation = {
        crafting: data.crafting ?? 0,
        ammo_crafting: data.ammo_crafting ?? 0,
        mechanic_crafting: data.mechanic_crafting ?? 0,
      };
      data.metadata = JSON.parse(data.metadata);
      delete data.crafting;
      delete data.ammo_crafting;
      delete data.mechanic_crafting;
      return data;
    },
  },
  {
    name: 'bank',
    query: `SELECT account_id, name, type, balance, access_level FROM bank_accounts LEFT JOIN bank_accounts_access USING (account_id) WHERE cid=?`,
    transformer: (data: any) => {
      return data.map((b: any) => {
        const perms = Financials.buildPermissions(b.access_level);
        delete b.access_level;
        return { ...b, permissions: perms };
      });
    },
  },
  {
    name: 'vehicles',
    query: `SELECT vin, model, plate, fakeplate, state, garageId from player_vehicles WHERE cid = ?`,
  },
];

export const characterRouter: FastifyPluginAsync = async server => {
  // Returns a list with all cids
  server.get('/', async (req, res) => {
    try {
      const info = await SQL.query(`
      SELECT steamid as steamId, citizenid as cid, firstname, lastname
      FROM characters
      LEFT JOIN character_info ci USING(citizenid)
      ORDER BY citizenid
    `);
      return res.code(200).send(info);
    } catch (e) {
      return res.code(500).send({
        message: 'Failed to retrieve all players information',
      });
    }
  });

  infoEndpoints.forEach(e => {
    server.get<{ Params: { cid: string } }>(`/${e.name}/:cid`, async (req, res) => {
      const cid = req.params.cid;
      if (!cid) {
        return res.code(400).send({
          message: 'No citizenid given',
        });
      }
      if (Number.isNaN(parseInt(cid))) {
        return res.code(400).send({
          message: 'Invalid citizenid given',
        });
      }
      try {
        let info = await SQL.query(e.query, [parseInt(cid)]);
        if (!info) {
          return res.code(500).send(null);
        }
        if (e.transformer) {
          info = e.transformer(info);
        }
        return res.code(200).send(info);
      } catch (e: any) {
        console.error(e);
        return res.code(500).send({
          message: `Failed to retrieve all characters ${e.name} information`,
        });
      }
    });
  });
};
