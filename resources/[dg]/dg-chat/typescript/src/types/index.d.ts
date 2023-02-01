type MessageType = 'normal' | 'warning' | 'error' | 'system' | 'success' | 'idcard';

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

  type Message = BaseMessage | CardMessage;

  interface BaseMessage {
    prefix: string;
    message: string;
    type?: Exclude<MessageType, 'idcard'>;
  }

  interface CardMessage {
    message: {
      firstName: string;
      lastName: string;
      dob: string;
      gender: 'M' | 'F';
      cid: number;
      nationality: string;
    };
    type: 'idcard';
  }
}
