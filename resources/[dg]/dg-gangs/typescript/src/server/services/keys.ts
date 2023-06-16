import { SQL } from '@dgx/server';
import gangManager from 'classes/gangmanager';
import { mainLogger } from 'sv_logger';

export const addContainerKeyNotice = () => {
  gangManager.addFeedMessage({
    title: 'Weapon container',
    content: 'We got notice a new container key has been given to a unknown citizen in town and is up for grabs',
  });
};

export const removeContainerKeyNotice = async (retry = 0) => {
  if (retry > 3) {
    mainLogger.error('Failed to delete a container key notice');
    return;
  }
  const results = await SQL.query<{ id: number }[]>(
    "SELECT id FROM gang_feed_messages where title='Weapon container' ORDER BY id ASC LIMIT 1"
  );
  if (!results || !results[0]) return;
  const success = gangManager.deleteFeedMessage(results[0].id);
  if (!success) {
    removeContainerKeyNotice(retry + 1);
  }
};

global.exports('addContainerKeyNotice', addContainerKeyNotice);
global.exports('removeContainerKeyNotice', removeContainerKeyNotice);
