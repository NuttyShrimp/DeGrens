import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { changeApp } from '../../lib';

import { useMessageStoreApp } from './stores/useMessageStoreApp';

export const addMessage = (
  phoneNr: string,
  pMessages: Phone.Messages.Message[],
  place?: 'append' | 'prepend',
  reset?: boolean
) => {
  const messages = { ...useMessageStoreApp.getState().messages };
  if (reset) {
    messages[phoneNr] = pMessages;
  } else {
    switch (place) {
      case 'append': {
        messages[phoneNr] = [...(messages[phoneNr] ?? []), ...pMessages];
        break;
      }
      case 'prepend': {
        messages[phoneNr] = [...pMessages, ...(messages[phoneNr] ?? [])];
        break;
      }
      default: {
        break;
      }
    }
  }
  useMessageStoreApp.setState({ messages: messages });
};

export const openConversation = async (phoneNr: string) => {
  const appState = useMessageStoreApp.getState();
  appState.currentNumber = phoneNr;
  const messages = (await nuiAction(
    'phone/messages/get',
    {
      target: phoneNr,
      offset: 0,
    },
    devData.messages
  )) ?? { [phoneNr]: [] }; // This will prevent from the app from crashing if the persons never send any messages
  appState.messages[phoneNr] = messages[phoneNr] || [];
  useMessageStoreApp.setState(appState);
  changeApp('messages');
  nuiAction('phone/messages/set-read', { target: phoneNr });
};
