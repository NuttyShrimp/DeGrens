import { useRacingAppStore } from './stores/racingAppStore';

export const events: Phone.Events = {};

events.toggleCreate = (data: boolean) => {
  useRacingAppStore.setState({ canCreateTrack: data });
};

events.toggleApp = (data: boolean) => {
  useRacingAppStore.setState({ hidden: data });
};

events.setRace = (data: Phone.Racing.Race | undefined) => {
  useRacingAppStore.setState({ selectedRace: data });
};

events.setRaceState = (data: Partial<Phone.Racing.Race>) => {
  if (useRacingAppStore.getState().selectedRace === undefined) return;
  useRacingAppStore.setState(state => {
    const selectedRace = { ...state.selectedRace!, ...data };
    return { selectedRace };
  });
};

events.syncRaceParticipant = (data: {
  participant: Phone.Racing.Race['participants'][number];
  action: 'add' | 'remove';
}) => {
  if (useRacingAppStore.getState().selectedRace === undefined) return;
  useRacingAppStore.setState(state => {
    const selectedRace = { ...state.selectedRace! };
    const index = selectedRace.participants.findIndex(p => p.cid === data.participant.cid);
    if (data.action === 'add') {
      if (index === -1) selectedRace.participants.push(data.participant);
    } else {
      if (index !== -1) selectedRace.participants.splice(index, 1);
    }
    return { selectedRace };
  });
};

events.syncRacePrize = (data: Record<number, number>) => {
  if (useRacingAppStore.getState().selectedRace === undefined) return;
  useRacingAppStore.setState(s => ({ selectedRace: { ...s.selectedRace!, prize: data } }));
};
