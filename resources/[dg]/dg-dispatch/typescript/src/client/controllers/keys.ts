import { Events, Hospital, Jobs, Keys, Notifications, Police, UI } from '@dgx/client';
import { closeCam, startCamMoveThread, stopCamMoveThread } from 'services/cams';
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

Keys.onPressDown('closeDispatchCam', () => {
  closeCam();
});
Keys.register('closeDispatchCam', '(police) Leave dispatch camera', 'ESCAPE');

Keys.onPressDown('dispatchCamUp', () => startCamMoveThread('up'));
Keys.onPressUp('dispatchCamUp', () => stopCamMoveThread('up'));
Keys.register('dispatchCamUp', '(police) Move dispatch camera up', 'W');

Keys.onPressDown('dispatchCamDown', () => startCamMoveThread('down'));
Keys.onPressUp('dispatchCamDown', () => stopCamMoveThread('down'));
Keys.register('dispatchCamDown', '(police) Move dispatch camera down', 'S');

Keys.onPressDown('dispatchCamRight', () => startCamMoveThread('right'));
Keys.onPressUp('dispatchCamRight', () => stopCamMoveThread('right'));
Keys.register('dispatchCamRight', '(police) Move dispatch camera right', 'D');

Keys.onPressDown('dispatchCamLeft', () => startCamMoveThread('left'));
Keys.onPressUp('dispatchCamLeft', () => stopCamMoveThread('left'));
Keys.register('dispatchCamLeft', '(police) Move dispatch camera left', 'A');
