import fastify from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import { Client } from 'minio';
import { setHttpCallback } from '@citizenfx/http-wrapper';
import { IMGUR_ID, MINIO_BUCKET_ID } from 'constant';
import { Events, Util } from '@dgx/server';

const server = fastify({
  clientErrorHandler: err => console.error(err),
  frameworkErrors(error) {
    console.error(error);
  },
});
const minioClient = new Client({
  endPoint: 'minioserver.nuttyshrimp.me',
  port: 443,
  accessKey: 'dg-user',
  secretKey: 'VwvULGav*vLEBH%QmjvY#HSe3c8#xsj9',
  useSSL: true,
});

const pendingUploads: Record<string, PendingUploadData> = {};

server.register(fastifyMultipart, {
  limits: {
    fileSize: 10485760,
    files: 1,
  },
});

server.post('/upload/:token', async (req, res) => {
  const { token } = req.params as Record<string, string>;

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST');

  if (!token || !pendingUploads[token]) {
    return res.send({ success: false });
  }

  const uploadData = pendingUploads[token];
  delete pendingUploads[token];
  // NOTE: atm not needed, can be implemented for string type
  if (uploadData.type !== 'buffer') return res.send({ success: false });

  const data = await req.file();
  if (!data) {
    return res.send({ success: false, message: 'no file attached?' });
  }
  try {
    const buffer = await data.toBuffer();
    uploadData.cb(buffer);
  } catch (err: any) {
    uploadData.cb(undefined, err.message);
    return res.send({ success: false });
  }
  return res.send({ success: true });
});

server.ready(err => {
  if (err) {
    console.error(err);
    return;
  }
  setHttpCallback((req: any, res: any) => {
    server.routing(req, res);
  });
});

setImmediate(async () => {
  const exists = await minioClient.bucketExists(MINIO_BUCKET_ID);
  if (!exists) {
    console.log(`Minio bucket with id ${MINIO_BUCKET_ID} not found. Trying to create one`);
    await minioClient.makeBucket(MINIO_BUCKET_ID, 'eu-west-1');
  }
});

const getUploadToken = () => {
  let tkn = Util.uuidv4();

  while (pendingUploads[tkn] !== undefined) {
    tkn = Util.uuidv4();
  }
  return tkn;
};

asyncExports('requestClientImgurScreenshot', async (player: number): Promise<string> => {
  const tkn = getUploadToken();

  const data: UploadRequest = {
    encoding: 'jpg',
    // Seeded on client
    correlation: '',
    targetURL: 'https://api.imgur.com/3/image',
    targetField: 'imgur',
    headers: {
      authorization: `Client-ID ${IMGUR_ID}`,
      'content-type': 'multipart/form-data',
    },
  };
  const request = new Promise<string>(res => {
    pendingUploads[tkn] = {
      type: 'string',
      cb(link) {
        res(link);
      },
    };
  });

  Events.emitNet('dg-imager:requestImgurScreenshot', Number(player), tkn, data);
  const result = await request;
  return result;
});

asyncExports('generateMinioFilename', async () => {
  let fileName = Util.uuidv4();
  const dObj = new Date();
  const date = `${dObj.getFullYear()}/${dObj.getMonth()}/${dObj.getDate()}/`;
  let found = false;
  let timeout = 100;
  while (!found || timeout > 0) {
    try {
      await minioClient.statObject(MINIO_BUCKET_ID, date + fileName);
      fileName = Util.uuidv4();
    } catch (e) {
      if (e == 'S3Error: Not Found') {
        found = true;
        break;
      }
      fileName = Util.uuidv4();
      timeout--;
      // console.error(e);
    }
  }
  if (timeout <= 0) {
    fileName = 'NOT_FOUND';
  }
  return fileName;
});

asyncExports('requestClientMinioScreenshot', async (player: string | number, metadata: any) => {
  const tkn = getUploadToken();
  if (metadata.fileName === 'NOT_FOUND') {
    return;
  }

  const options: UploadRequest = {
    targetURL: `/${GetCurrentResourceName()}/upload/${tkn}`,
    targetField: 'file',
    correlation: '',
    encoding: 'png',
    headers: {},
  };

  const fileName = metadata.fileName + '.png';
  const dObj = new Date();
  const date = `${dObj.getFullYear()}/${dObj.getMonth() + 1}/${dObj.getDate()}`;

  const request = new Promise<string>(res => {
    const middlewareCb = async (fBuffer?: Buffer, err?: string) => {
      if (err) {
        throw Error(err || 'unknown error');
      }

      await minioClient.putObject(MINIO_BUCKET_ID, `${date}/${fileName}`, fBuffer!);
      const filePath = `https://minioserver.nuttyshrimp.me/dg-image-storage/${date}/${fileName}`;
      res(filePath);
    };

    pendingUploads[tkn] = {
      type: 'buffer',
      cb: middlewareCb,
    };
  });

  Events.emitNet('dg-imager:requestMinioScreenshot', Number(player), options);

  const result = await request;
  return result;
});

Events.onNet('dg-imager:finishImgureScreenshot', (src, token: string, data: string) => {
  const link: string = JSON.parse(data)?.data?.link;
  const uploadData = pendingUploads[token];
  if (uploadData && uploadData.type === 'string') {
    uploadData.cb(link);
    delete pendingUploads[token];
  }
});

RegisterCommand(
  'imager:imgur',
  async (src: number) => {
    const imgurLink = await global.exports['dg-imager'].requestClientImgurScreenshot(src);
    console.log(imgurLink);
  },
  false
);

RegisterCommand(
  'imager:minio',
  async (src: number) => {
    const fileName = await global.exports['dg-imager'].generateMinioFilename();
    console.log(fileName);
    const filePath = await global.exports['dg-imager'].requestClientMinioScreenshot(src, { fileName });
    console.log(filePath);
  },
  false
);
