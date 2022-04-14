export namespace Chat {
  type MessageType = 'normal' | 'warning' | 'error' | 'system' | 'success';

  interface Message {
    prefix: string;
    message: string;
    type: ChatMessageType;
  }

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
