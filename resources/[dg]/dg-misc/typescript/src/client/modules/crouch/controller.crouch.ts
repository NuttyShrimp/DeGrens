import { Hospital, Keys, Police } from '@dgx/client';
import { toggleCrouching } from './service.crouch';

Keys.register('crouch', 'Bukken', 'LCONTROL');
Keys.onPressDown('crouch', () => {
  if (Police.isCuffed() || Hospital.isDown()) return;
  toggleCrouching();
});
