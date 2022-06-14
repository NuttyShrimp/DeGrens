import React, { useEffect } from 'react';

import { Conversation } from './components/conversation';
import { List } from './components/list';

const Component: AppFunction<Phone.Messages.State> = props => {
  useEffect(() => {
    return () => {
      props.updateState({
        currentNumber: null,
      });
    };
  }, []);
  return props.currentNumber === null ? (
    <List list={props.messages} updateState={props.updateState} />
  ) : (
    <Conversation {...props} />
  );
};

export default Component;
