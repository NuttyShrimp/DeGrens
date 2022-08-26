declare namespace Auth {
  interface PlyData {
    timeStamp: number;
    source: number;
    steamId: string;
  }
}

declare namespace IAPI {
  type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
  type Responser = (code: number, data: any, headers?: Record<string, string>) => void;
}
