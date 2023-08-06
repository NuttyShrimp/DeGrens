import { useRealEstateStore } from './stores/useRealEstateStore';

export const events: Phone.Events = {};

events.changeLockState = ({ name, locked }: { name: string; locked: boolean }) => {
  useRealEstateStore.getState().toggleLock(name, locked);
};
