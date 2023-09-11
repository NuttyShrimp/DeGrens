import { Events, Hospital, Jobs, Keys, Notifications, Police, UI } from '@dgx/client';
import { clearFlashThread, getLastCallId, setDispatchOpen } from 'services/dispatch';

let hasCursor = false;

Keys.onPressDown('setLastCall', () => {
  if (!Keys.isModPressed()) return;
  const id = getLastCallId();
  if (!id) return;
  Events.emitNet('dispatch:server:setMarker', id);
});
Keys.register('setLastCall', '(gov) Set marker to last call (+ mod)');

Keys.onPressDown('openDispatch', () => {
  const currentJob = Jobs.getCurrentJob().name;
  if (currentJob !== 'police' && currentJob !== 'ambulance') return;
  if (Police.isCuffed() || Hospital.isDown()) {
    Notifications.add('Je kan dit momenteel niet', 'error');
    return;
  }
  clearFlashThread();
  setDispatchOpen(true);
  hasCursor = Keys.isModPressed();
  UI.openApplication(
    'dispatch',
    {
      showCamera: hasCursor && currentJob === 'police',
      hasCursor, // used to determine passive/interactive apptype
    },
    !hasCursor
  );
});

Keys.onPressUp('openDispatch', () => {
  if (hasCursor) {
    hasCursor = false;
    return;
  }

  UI.closeApplication('dispatch');
});
Keys.register('openDispatch', '(gov) Open dispatch (focus w modifier)');
