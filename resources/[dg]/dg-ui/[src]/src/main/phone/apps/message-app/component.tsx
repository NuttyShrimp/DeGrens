import React, { useEffect } from 'react';

import { Conversation } from './components/conversation';
import { List } from './components/list';
import { useMessageStoreApp } from './stores/useMessageStoreApp';

const Component = () => {
  const [setNumber, currentNumber] = useMessageStoreApp(s => [s.setNumber, s.currentNumber]);
  useEffect(() => {
    return () => {
      setNumber(null);
    };
  }, []);
  return currentNumber === null ? <List /> : <Conversation />;
};

export default Component;
