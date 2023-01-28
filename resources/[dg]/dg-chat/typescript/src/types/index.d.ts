type MessageType = 'normal' | 'warning' | 'error' | 'system' | 'success';

declare namespace Server {
  type CommandHandler = (src: number, cmd: string, args: string[]) => void;

  interface Command extends Shared.Command {
    handler: CommandHandler;
  }
}

declare namespace Shared {
  interface Parameter {
    name: string;
    description?: string;
    required?: boolean;
  }

  interface Command {
    name: string;
    description: string;
    parameters: Parameter[];
    permissionLevel: string;
  }

  interface Message {
    prefix: string;
    message: string;
    type?: MessageType;
  }
}
