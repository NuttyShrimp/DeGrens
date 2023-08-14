declare namespace Chat {
  type CommandHandler = (src: number, cmd: string, args: string[]) => void;
  type MessageType = 'normal' | 'warning' | 'error' | 'system' | 'success' | 'idcard';

  interface Parameter {
    name: string;
    description: string;
    required?: boolean;
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
