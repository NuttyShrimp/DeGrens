import { useMainStore } from './stores/useMainStore';
import { copyToClipboard } from './util';

export const events: { [appName: string]: (evt: any) => void } = {
  main: evt => {
    switch (evt.data.data.event) {
      case 'restart': {
        useMainStore.setState({
          mounted: false,
        });
      }
    }
  },
  game: evt => {
    useMainStore.setState(s => ({
      game: {
        ...s.game,
        ...evt.data.data,
      },
    }));
  },
  character: evt => {
    useMainStore.setState(s => ({
      character: {
        ...s.character,
        ...evt.data.data,
      },
    }));
  },
  jobs: evt => {
    useMainStore.setState({
      jobs: evt.data.data,
    });
  },
  copy: evt => {
    copyToClipboard(evt.data.data);
  },
};
