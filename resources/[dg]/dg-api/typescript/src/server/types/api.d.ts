declare namespace API {
  type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

  type Responser = (code: number, data: any, headers?: Record<string, string>) => void;

  interface Token {
    token: string;
    comment: string;
  }

  interface Route {
    method: Method;
    path: string;
    handler: (request: any, res: Responser) => any;
  }
}
