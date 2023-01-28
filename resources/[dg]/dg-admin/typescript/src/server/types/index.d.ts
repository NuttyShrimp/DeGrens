declare namespace Permissions {
  interface Role {
    name: string;
    power: number;
    allowAFK: boolean;
  }
  interface PlayerRole {
    steamid: string;
    role: string;
    name: string;
  }
}

declare interface UserData {
  source: number;
  name: string;
  cid: number;
  steamId: string;
}

declare interface CommandData {
  name: string;
  // Role needed to execute command
  role: string;
  // logString will be used to suffix the short log message
  log: string;
  // At which target menu to show up as quick option
  target: number[] | false;
  // If handler should run on client
  isClientCommand: boolean;
  handler: (caller: UserData, args?: any) => void;
  UI: Omit<UI.Entry, 'name'>;
}

declare interface DiscordConfig {
  whitelist: {
    enabled: boolean;
    roles: Record<string, string>;
  };
  guildId: string;
  token: string;
}
