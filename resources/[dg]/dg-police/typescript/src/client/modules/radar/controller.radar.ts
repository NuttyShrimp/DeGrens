import { BaseEvents, Jobs, Keys, Notifications } from '@dgx/client';
import {
  isRadarActive,
  isRadarEnabled,
  lockPlate,
  openPlateHistory,
  resetRadar,
  setRadarActive,
  setRadarEnabled,
} from './service.radar';

Keys.register('police_radar_toggle', '(police) Radar - Toggle (+mod)', '7');
Keys.onPressDown('police_radar_toggle', () => {
  if (!Keys.isModPressed()) return;
  if (Jobs.getCurrentJob().name !== 'police') return;
  setRadarEnabled(!isRadarEnabled());
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

BaseEvents.onVehicleEngineStateChange((_, engineState) => {
  if (!engineState) {
    if (isRadarActive()) {
      setRadarActive(false);
    }
    return;
  }

  if (isRadarEnabled()) {
    setRadarActive(true, true);
  }
});
