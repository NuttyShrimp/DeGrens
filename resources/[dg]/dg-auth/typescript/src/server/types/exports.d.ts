declare interface ServerExports {
  'dg-auth': {
    getKeysForServer: () => Auth.SecretKeys | undefined;
    logEvent: (entry: EventLog) => void;
    isEventDebugTokenValid: (token: string) => boolean;
    subscribeToEvents: (cb: (events: EventLog[]) => void) => number;
    removeSubscriber: (subId: number) => void;
  };
}
