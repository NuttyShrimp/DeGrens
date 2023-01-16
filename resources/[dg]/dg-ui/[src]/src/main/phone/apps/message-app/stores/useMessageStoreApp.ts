import { create } from '@src/lib/store';

export const useMessageStoreApp = create<Phone.Messages.State>('phone.app.messages')(set => ({
  messages: {},
  currentNumber: null,
  setNumber: num => set(() => ({ currentNumber: num })),
  setMessages: msgs => set(() => ({ messages: msgs })),
}));
