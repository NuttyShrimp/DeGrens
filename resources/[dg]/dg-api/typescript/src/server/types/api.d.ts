declare namespace API {
  type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

  type Responser = (code: number, data: any, headers?: Record<string, string>) => void;

  type Handler = (request: any, res: Responser) => any;

  interface Token {
    token: string;
    comment: string;
  }

  interface Route {
    method: Method;
    path: string;
    params: Record<string, number>;
    handler: Handler;
  }

  interface Player {
    source: number;
    cid: number;
    firstname: string;
    lastname: string;
  }
}
