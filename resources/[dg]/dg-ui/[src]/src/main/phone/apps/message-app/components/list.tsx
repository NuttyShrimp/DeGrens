import { FC, useEffect, useState } from 'react';

import { Paper } from '../../../../../components/paper';
import { devData } from '../../../../../lib/devdata';
import { nuiAction } from '../../../../../lib/nui-comms';
import { showFormModal } from '../../../lib';
import { AppContainer } from '../../../os/appcontainer/appcontainer';
import { getContact } from '../../contacts-app/lib';
import { openConversation } from '../lib';
import { useMessageStoreApp } from '../stores/useMessageStoreApp';

import { styles } from './messages.styles';
import { NewConversationModal } from './modals';

declare interface ListEntry {
  messages: Phone.Messages.Message[];
  nr: string;
  label: string;
  hasUnread: boolean;
}

export const List: FC<{}> = () => {
  const classes = styles();
  const [list, setList] = useState<ListEntry[]>([]);
  const [filteredList, setFilteredList] = useState<ListEntry[]>([]);
  const [setMessages, msgs] = useMessageStoreApp(s => [s.setMessages, s.messages]);

  const fetchMessages = async () => {
    const messages = await nuiAction<Record<string, Phone.Messages.Message[]>>(
      'phone/messages/get',
      {},
      devData.messages
    );
    Object.entries(messages)
      .sort(([_, c1V], [__, c2V]) => (c1V.at(-1)?.date ?? 0) - (c2V.at(-1)?.date ?? 0))
      .forEach(KeyValuePair => {
        messages[KeyValuePair[0]] = KeyValuePair[1];
      });

    setMessages(messages);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    const newList: any = [];
    Object.entries(msgs).forEach(([nr, value]) => {
      const contact = getContact(nr);
      newList.push({
        nr,
        label: contact?.label ?? nr,
        messages: value,
        hasUnread: (value ?? []).some(m => !m.isread),
      });
    });
    setList(newList);
    setFilteredList(newList);
  }, [msgs]);

  return (
    <AppContainer
      primaryActions={[
        {
          title: 'Nieuw bericht',
          onClick: () => {
            showFormModal(<NewConversationModal />);
          },
          icon: 'comment',
        },
      ]}
      search={{
        list,
        filter: ['nr', 'label'],
        onChange: value => {
          setFilteredList(value);
        },
      }}
      emptyList={Object.keys(msgs).length === 0}
    >
      <div className={classes.list}>
        {filteredList.map(e => (
          <Paper
            key={e.nr}
            title={e.label}
            description={e.messages[e.messages.length - 1].message}
            image={'comments'}
            onClick={() => openConversation(e.nr)}
            notification={e.hasUnread}
          />
        ))}
      </div>
    </AppContainer>
  );
};
