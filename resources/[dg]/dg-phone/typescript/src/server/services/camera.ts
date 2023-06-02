import { Events, RPC, SQL, Screenshot, Util } from '@dgx/server';

Events.onNet('phone:camera:delete', async (src, imageId: number) => {
  const cid = Util.getCID(src);
  await SQL.query('DELETE FROM phone_images WHERE cid = ? AND id = ?', [cid, imageId]);
});

RPC.register('phone:camera:get', async src => {
  const cid = Util.getCID(src);
  const images = await SQL.query('SELECT id, link FROM phone_images WHERE cid = ? ORDER BY id DESC', [cid]);
  return images ?? [];
});

RPC.register('phone:camera:take', async src => {
  const cid = Util.getCID(src);
  const minioId = await Screenshot.generateMinioFilename();
  try {
    const minioLink = await Screenshot.minio(src, { fileName: minioId });
    if (!minioLink) {
      return false;
    }

    const result = await SQL.query('INSERT INTO phone_images (cid, link) VALUES (?, ?)', [cid, minioLink]);
    return !!result;
  } catch (e) {
    console.error(e);
    return false;
  }
});
