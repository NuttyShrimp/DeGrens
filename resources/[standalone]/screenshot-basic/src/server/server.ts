import { setHttpCallback } from '@citizenfx/http-wrapper';
import { File } from 'formidable';
import * as fs from 'fs';
import * as Koa from 'koa';
import * as koaBody from 'koa-body';
import * as Router from 'koa-router';
import * as Minio from 'minio';
import * as mv from 'mv';
import { v4 } from 'uuid';

const app = new Koa();
const router = new Router();
const minioClient = new Minio.Client({
  endPoint: 'minioserver.nuttyshrimp.me',
  port: 443,
  accessKey: 'dg-user',
  secretKey: 'VwvULGav*vLEBH%QmjvY#HSe3c8#xsj9',
  useSSL: true,
});

class UploadData {
  fileName?: string;

  cb: (err: string | boolean, data: string) => void;
}

const uploads: { [token: string]: UploadData } = {};
const imgurs: { [token: string]: { cb: Function } } = {};
const IMGUR_ID = '5ed58555618e037';
const MINIO_BUCKET_ID = 'dg-image-storage';

router.post('/upload/:token', async ctx => {
  const tkn: string = ctx.params['token'];

  ctx.response.append('Access-Control-Allow-Origin', '*');
  ctx.response.append('Access-Control-Allow-Methods', 'GET, POST');

  if (uploads[tkn] !== undefined) {
    const upload = uploads[tkn];
    delete uploads[tkn];

    const finish = (err: string, data: string) => {
      setImmediate(() => {
        upload.cb(err || false, data);
      });
    };

    const f = ctx.request.files['file'] as File;

    if (f) {
      if (upload.fileName) {
        mv(f.path, upload.fileName, err => {
          if (err) {
            finish(err.message, null);
            return;
          }

          finish(null, upload.fileName);
        });
      } else {
        fs.readFile(f.path, (err, data) => {
          if (err) {
            finish(err.message, null);
            return;
          }

          fs.unlink(f.path, err => {
            finish(null, `data:${f.type};base64,${data.toString('base64')}`);
          });
        });
      }
    }

    ctx.body = { success: true };

    return;
  }

  ctx.body = { success: false };
});

app
  .use(
    koaBody({
      patchKoa: true,
      multipart: true,
    })
  )
  .use(router.routes())
  .use(router.allowedMethods());

setHttpCallback(app.callback());

setImmediate(async () => {
  const exists = await minioClient.bucketExists(MINIO_BUCKET_ID);
  if (!exists) {
    console.log(`Minio bucket with id ${MINIO_BUCKET_ID} not found. Trying to create one`);
    await minioClient.makeBucket(MINIO_BUCKET_ID, 'eu-west-1');
  }
});

// Cfx stuff
const exp = (<any>global).exports;

exp(
  'requestClientScreenshot',
  (player: string | number, options: any, cb: (err: string | boolean, data: string) => void) => {
    const tkn = v4();

    const fileName = options.fileName;
    delete options['fileName']; // so the client won't get to know this

    uploads[tkn] = {
      fileName,
      cb,
    };

    emitNet('screenshot_basic:requestScreenshot', player, options, `/${GetCurrentResourceName()}/upload/${tkn}`);
  }
);

exp('requestClientImgurScreenshot', async (player: string | number): Promise<string> => {
  const tkn = v4();

  const data = {
    link: 'https://api.imgur.com/3/image',
    field: 'imgur',
    headers: {
      authorization: `Client-ID ${IMGUR_ID}`,
      'content-type': 'multipart/form-data',
    },
    tkn,
  };
  const request = new Promise<string>(res => {
    imgurs[tkn] = {
      cb(link: string) {
        res(link);
      },
    };
  });

  emitNet('screenshot_basic:requestImgurScreenshot', player, data);
  const result = await request;
  return result;
});

onNet('screenshot-basic:incomingImgurScreenshot', (data: any, screenData: string) => {
  const link = JSON.parse(screenData).data.link;
  if (imgurs[data.tkn]) {
    imgurs[data.tkn].cb(link);
    delete imgurs[data.tkn];
  }
});

exp('generateMinioFilename', async () => {
  let fileName = v4();
  const dObj = new Date();
  const date = `${dObj.getFullYear()}/${dObj.getMonth()}/${dObj.getDate()}/`;
  let found = false;
  while (!found) {
    try {
      await minioClient.statObject(MINIO_BUCKET_ID, date + fileName);
      fileName = v4();
    } catch (e) {
      if (e == 'S3Error: Not Found') {
        found = true;
        break;
      }
      fileName = v4();
      console.error(e);
    }
  }
  return fileName;
});

global.exports('requestClientMinioScreenshot', async (player: string | number, options: any) => {
  const tkn = v4();

  const fileName = options.fileName + '.png';
  const dObj = new Date();
  const date = `${dObj.getFullYear()}/${dObj.getMonth() + 1}/${dObj.getDate()}`;
  delete options['fileName']; // so the client won't get to know this

  const request = new Promise<string>(res => {
    const middlewareCb = async (err: string | false, fPath: string) => {
      if (err) {
        throw Error(err || 'unknown error');
      }

      const data = fs.readFileSync(fPath);
      fs.unlinkSync(fPath);
      await minioClient.putObject(MINIO_BUCKET_ID, `${date}/${fileName}`, data);
      const filePath = `https://minioserver.nuttyshrimp.me/dg-image-storage/${date}/${fileName}`;
      res(filePath);
      return;
    };

    uploads[tkn] = {
      fileName: 'uploads/' + fileName,
      cb: middlewareCb,
    };
  });

  emitNet('screenshot_basic:requestScreenshot', player, options, `/${GetCurrentResourceName()}/upload/${tkn}`);

  const result = await request;
  return result;
});
