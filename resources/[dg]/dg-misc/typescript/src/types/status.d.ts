declare namespace Status {
  type Name = StatusName;

  type RemovalMethod = 'revive' | 'water';

  type ConfigData = {
    name: Name;
    label: string;
    duration?: number;
    removalMethod?: RemovalMethod;
    removalMessage?: string; // If defined, message gets shown as notif on removal
  };

  type Active = {
    name: Status.Name;
    timeout?: NodeJS.Timeout;
  };
}
