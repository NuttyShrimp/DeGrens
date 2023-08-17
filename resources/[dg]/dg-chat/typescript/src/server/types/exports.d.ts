declare interface ServerExports {
  chat: {
    refreshCommands: (src?: number) => void;
    registerCommand: (
      name: string,
      description: string,
      parameters: Shared.Parameter[] = [],
      permissionLevel: string,
      handler: Server.CommandHandler
    ) => void;
  };
}
