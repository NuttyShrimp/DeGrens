import { Events, UI } from '@dgx/client';
import { startTabletAnimation, stopTabletAnimation } from './animations';

let isOpen = false;

const openLaptop = async () => {
  if (isOpen) return;
  isOpen = true;
  startTabletAnimation();
  UI.openApplication('laptop');
};

const closeLaptop = () => {
  if (!isOpen) return;
  isOpen = false;
  stopTabletAnimation();
};

on('dg-ui:application-closed', (appName: string) => {
  if (appName !== 'laptop') return;
  closeLaptop();
});

on('dg-ui:reload', () => {
  closeLaptop();
});

Events.onNet('misc:client:openLaptop', () => {
  openLaptop();
});
