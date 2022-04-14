declare namespace Chat {
  type CommandHandler = (src: number, cmd: string, args: string[]) => void;
  type MessageType = 'normal' | 'warning' | 'error' | 'system' | 'success';

  interface Parameter {
    name: string;
    description: string;
    required?: boolean;
  }

  interface Message {
    prefix: string;
    message: string;
    type: MessageType;
  }
}