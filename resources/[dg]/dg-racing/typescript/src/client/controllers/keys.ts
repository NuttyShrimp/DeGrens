import { Keys } from '@dgx/client';
import {
  creatingATrack,
  cancelTrackCreation,
  finishTrackCreation,
  placeCheckpoint,
  setSpread,
  undoCheckpoint,
  removeNearestCheckpoint,
} from 'services/creator';

Keys.onPressDown('race-creator-exit', () => {
  if (!creatingATrack()) return;
  cancelTrackCreation();
});

Keys.onPressDown('race-creator-finish', () => {
  if (!creatingATrack()) return;
  finishTrackCreation();
});

Keys.onPressDown('race-creator-undo', () => {
  if (!creatingATrack()) return;
  undoCheckpoint();
});

Keys.onPressDown('race-creator-place', () => {
  if (!creatingATrack()) return;
  placeCheckpoint();
});

Keys.onPressDown('race-creator-spread-wider', () => {
  if (!creatingATrack()) return;
  setSpread(Keys.isModPressed() ? 0.1 : 1);
});

Keys.onPressDown('race-creator-spread-smaller', () => {
  if (!creatingATrack()) return;
  setSpread(Keys.isModPressed() ? -0.1 : -1);
});

Keys.onPressDown('race-creator-remove', () => {
  if (!creatingATrack()) return;
  removeNearestCheckpoint();
});

Keys.register('race-creator-exit', '(racing) Stop creating a race', 'X');
Keys.register('race-creator-finish', '(racing) Finish the created race', 'Y');
Keys.register('race-creator-undo', '(racing) Undo the last placed checkpoint', 'U');
Keys.register('race-creator-remove', '(racing) Remove the nearest checkpoint', 'I');
Keys.register('race-creator-place', '(racing) Place a checkpoint in the race creator', 'E');
Keys.register('race-creator-spread-wider', '(racing) Make checkpoint wider', 'J');
Keys.register('race-creator-spread-smaller', '(racing) Make checkpoint smaller', 'K');
