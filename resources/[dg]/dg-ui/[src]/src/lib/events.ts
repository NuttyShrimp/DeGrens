import { useMainStore } from './stores/useMainStore';
import { copyToClipboard } from './util';

export const events: { [appName: string]: (evt: any) => void } = {
  main: evt => {
    switch (evt.data.data.event) {
      case 'restart': {
        useMainStore.setState({
          mounted: false,
        });
        break;
      }
      case 'gamebg': {
        if (!import.meta.env.DEV) return;
        const rootElement = document.getElementById('root');
        if (!rootElement) return;
        if (rootElement.style.backgroundImage === '') {
          rootElement.style.backgroundImage =
            'url(https://minioserver.nuttyshrimp.me/dg-image-storage/2023/6/1/0c8b5910-7c8d-408c-b4c1-9abaab76cf8c.png)';
          rootElement.style.backgroundSize = 'cover';
        } else {
          rootElement.style.backgroundImage = '';
        }
        break;
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
