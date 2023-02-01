import { Store } from 'vuex';
import { Chat, State } from '../types/chat';

export const testMessages: Chat.Message[] = [
  {
    message: 'BOZO<br>KAPP',
    prefix: 'Me:',
    type: 'normal',
  },
  {
    message: 'This is a bozo alert',
    prefix: 'System:',
    type: 'system',
  },
  {
    message: 'I am a bozo',
    prefix: 'Report(Cry baby|69): ',
    type: 'success',
  },
  {
    message: "Bozo doesn't have enough money",
    prefix: 'Bank: ',
    type: 'error',
  },
  {
    message: 'Bozo ran into a problem',
    prefix: 'System: ',
    type: 'warning',
  },
  {
    message: {
      cid: 1000,
      dob: "11/9/2001",
      firstName: "John",
      lastName: "doe",
      gender: "M",
      nationality: "BEL"
    },
    type: 'idcard',
  },
];

export const devStorePlugin = (store: Store<State>) => {
  if (import.meta.env.PROD) return;
  store.commit("setIsMsgVisible", true)
  store.commit("setIsInputVisible", true)
  testMessages.forEach(msg => {
    store.commit("addMessage", msg)
  })
}
