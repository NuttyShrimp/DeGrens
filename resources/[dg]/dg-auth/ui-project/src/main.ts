import { onEvent } from './panel/events';
import { setInfo } from './panel/reportsocket';

const msgListener = (evt: MessageEvent) => {
  onEvent(evt);
  switch (evt.data.action) {
    case 'init-panel': {
      setInfo(evt.data.data);
      break;
    }
  }
};

window.addEventListener('message', msgListener);
