import { SQL } from '@dgx/server';

export const fetchReputationsForCid = async (cid: number) => {
  const query = `SELECT * FROM character_reputations WHERE citizenid = ?`;
  const result: { citizenid: number } & Record<string, number> = await SQL.scalar(query, [cid]);
  const { citizenid, ...data } = result;
  return data;
};

export const insertDefaultForCid = async (cid: number) => {
  await SQL.insertValues('character_reputations', [{ citizenid: cid }]);
};

// please forgive me for this shit
export const updateReputationForCid = async (cid: number, type: ReputationType, value: number) => {
  const query = `UPDATE character_reputations SET ${type} = ? WHERE citizenid = ?`;
  await SQL.query(query, [value, cid]);
};
