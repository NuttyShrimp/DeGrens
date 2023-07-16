import { changeDoorState, getDoorCoords, getDoorIdByName } from 'services/doors';
import { mainLogger } from 'sv_logger';

global.exports('changeDoorState', (doorName: string, state: boolean) => {
  const id = getDoorIdByName(doorName);
  if (!id) {
    mainLogger.error(`Could not get doorId of name '${doorName}'`);
    return;
  }
  changeDoorState(id, state);
});

global.exports('getDoorCoordsByName', (doorName: string) => {
  const id = getDoorIdByName(doorName);
  if (!id) {
    mainLogger.error(`Could not get doorId of name '${doorName}'`);
    return;
  }
  return getDoorCoords(id);
});
