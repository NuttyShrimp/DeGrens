import groupManager from './classes/GroupManager';
import nameManager from './classes/NameManager';

/**
 * Creates an array with the stripped data for the client
 * Should contain only the bare minimum data is should need
 */
export const getGroupList = (): JobGroup[] => {
  const groups = groupManager.getGroups();
  return groups.map(g => ({
    id: g.getId(),
    name: nameManager.getName(g.getOwner().cid),
    size: g.getMembers().length,
    limit: g.getLimit(),
  }));
};
