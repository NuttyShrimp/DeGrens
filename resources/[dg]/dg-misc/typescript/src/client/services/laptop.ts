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

UI.onApplicationClose(() => {
  closeLaptop();
}, 'laptop');

UI.onUIReload(() => {
  closeLaptop();
});

Events.onNet('misc:client:openLaptop', () => {
  openLaptop();
});
