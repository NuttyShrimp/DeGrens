import { Jobs, Keys, Notifications } from '@dgx/client/classes';
import { isRadarActive, lockPlate, openPlateHistory, resetRadar, setRadarActive } from './service.radar';

Keys.register('police_radar_toggle', '(police) Radar - Toggle (+mod)', '7');
Keys.onPressDown('police_radar_toggle', () => {
  if (!Keys.isModPressed()) return;
  if (Jobs.getCurrentJob().name !== 'police') return;
  setRadarActive(!isRadarActive());
});

Keys.register('police_radar_reset', '(police) Radar - Reset', '8');
Keys.onPressDown('police_radar_reset', () => {
  if (Jobs.getCurrentJob().name !== 'police') return;
  if (!isRadarActive()) return;
  resetRadar();
  Notifications.add('Je radar is gereset', 'success');
});

Keys.register('police_radar_lock', '(police) Radar - Lock', '9');
Keys.onPressDown('police_radar_lock', () => {
  if (Jobs.getCurrentJob().name !== 'police') return;
  if (!isRadarActive()) return;
  lockPlate();
});

Keys.register('police_radar_history', '(police) Radar - History (+mod)', '0');
Keys.onPressDown('police_radar_history', () => {
  if (!Keys.isModPressed()) return;
  if (Jobs.getCurrentJob().name !== 'police') return;
  openPlateHistory();
});

on('baseevents:leftVehicle', () => {
  setRadarActive(false);
});

on('baseevents:engineStateChanged', (_: any, engineState: boolean) => {
  if (engineState) return;
  setRadarActive(false);
});
