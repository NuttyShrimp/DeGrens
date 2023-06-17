import { SQL } from '@dgx/server';

export const fetchContainerKeyItems = (): Promise<{ containerId: string; keyItemId: string | null }[]> => {
  const query = `SELECT * FROM container_benches`;
  return SQL.query(query);
};

export const updateContainerKeyItemId = async (containerId: string, keyItemId: string | null) => {
  const query = `INSERT INTO container_benches (containerId, keyItemId) VALUES (?, ?) ON DUPLICATE KEY UPDATE keyItemId = VALUES(keyItemId)`;
  await SQL.query(query, [containerId, keyItemId]);
};

export const updateContainerKeyGang = async (containerId: string, gang: string) => {
  const query = `INSERT INTO container_benches (containerId, gang) VALUES (?, ?) ON DUPLICATE KEY UPDATE gang = VALUES(gang)`;
  await SQL.query(query, [containerId, gang]);
};

export const doesGangHaveContainerKey = async (gang: string) => {
  const result = await SQL.query<unknown[]>(
    'SELECT * FROM container_benches WHERE keyItemId IS NOT NULL AND gang = ?',
    [gang]
  );
  return (result ?? []).length > 0;
};
