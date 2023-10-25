declare namespace Auth {
  type SecretKeys = {
    event: string;
    encrypt: string;
    decode: string;
  };

  declare type EventLog = {
    send: 'client' | 'server';
    recv: 'client' | 'server';
    event: string;
    // payload/args of event serialized to string
    data: any;
    target: number;
    rpc?: boolean;
    // resp of rpc serialized to string
    response?: any;
  };
}
