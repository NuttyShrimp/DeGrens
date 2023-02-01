export namespace Chat {
  type MessageType = 'normal' | 'warning' | 'error' | 'system' | 'success' | 'idcard' | 'driverlicense';

  interface BaseMessage {
    prefix?: string;
    message: string;
    type: Exclude<ChatMessageType, 'idcard' | 'driverlicense'>;
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

  type Message = BaseMessage | IdCardMessage;

  interface SuggestionParameter {
    name: string;
    description: string;
    required: boolean;
  }

  interface Suggestion {
    name: string;
    description: string;
    parameters: SuggestionParameter[];
  }
}

export interface State {
  messages: Chat.Message[];
  suggestions: Chat.Suggestion[];
  history: string[];
  isMsgVisible: boolean;
  isInputVisible: boolean;
  isScrolling: boolean;
  isLocked: boolean;
}
