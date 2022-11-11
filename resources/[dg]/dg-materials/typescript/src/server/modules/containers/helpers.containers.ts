import { SQL } from '@dgx/server';

export const fetchContainerKeyItems = (): Promise<{ containerId: string; keyItemId: string | null }[]> => {
  const query = `SELECT * FROM container_benches`;
  return SQL.query(query);
};

export const updateContainerKeyItemId = async (containerId: string, keyItemId: string | null) => {
  const query = `INSERT INTO container_benches (containerId, keyItemId) VALUES (?, ?) ON DUPLICATE KEY UPDATE keyItemId = VALUES(keyItemId)`;
  await SQL.query(query, [containerId, keyItemId]);
};
