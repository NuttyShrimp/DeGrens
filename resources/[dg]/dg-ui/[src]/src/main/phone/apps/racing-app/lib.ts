import { devData } from '@src/lib/devdata';
import { nuiAction } from '@src/lib/nui-comms';

import { useRacingAppStore } from './stores/racingAppStore';

export const loadTracks = async () => {
  const tracks = await nuiAction('phone/racing/tracks', undefined, devData.racingTracks);
  useRacingAppStore.setState({ tracks });
};
