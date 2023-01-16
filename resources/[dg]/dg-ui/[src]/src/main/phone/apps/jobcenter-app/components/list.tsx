import React, { FC, useEffect } from 'react';
import { Button } from '@components/button';
import { Divider, Typography } from '@mui/material';
import { Icon } from '@src/components/icon';
import { Paper } from '@src/components/paper';
import { devData } from '@src/lib/devdata';
import { nuiAction } from '@src/lib/nui-comms';
import { addNotification } from '@src/main/phone/lib';

import { useJobcenterAppStore } from '../stores/useJobcenterAppStore';

const GroupElement: FC<{ group: Phone.JobCenter.Group; canEnter?: boolean }> = ({ group, canEnter }) => {
  const handleRequestToJoin = () => {
    if (!canEnter) return;
    nuiAction('phone/jobs/groups/join', {
      id: group.id,
    });
    addNotification({
      id: 'phone-jobs-groups-join',
      title: 'jobcenter',
      description: 'Wachten op toegang...',
      sticky: true,
      icon: 'jobcenter',
    });
  };
  return (
    <Paper
      title={group.name}
      description={
        <div className='jobcenter__groups__actions'>
          <div className='request' onClick={() => handleRequestToJoin()}>
            <Icon name='sign-in-alt' size='1rem' />
          </div>
          <div className='jobcenter__groups__actions__sizes'>
            <div>
              <Icon name='users' size='1rem' />
              <span>{group.limit}</span>
            </div>
            <div>
              <Icon name='user' size='1rem' />
              <span>{group.size}</span>
            </div>
          </div>
        </div>
      }
      image={'users'}
    />
  );
};

export const List: FC<{}> = () => {
  const [setGroups, groups] = useJobcenterAppStore(s => [s.setGroups, s.groups]);
  const fetchGroups = async () => {
    const groups = await nuiAction('phone/jobs/groups/get', {}, devData.jobGroups);
    setGroups(groups);
  };

  const handleGroupCreation = () => {
    nuiAction('phone/jobs/groups/create');
  };

  useEffect(() => {
    fetchGroups();
  }, []);
  return (
    <div className='jobcenter__groups__list'>
      <Button.Primary onClick={handleGroupCreation}>Create Group</Button.Primary>
      <Typography variant={'subtitle1'}>Inactieve</Typography>
      {groups
        .filter(g => g.idle)
        .map(g => (
          <GroupElement key={g.id} group={g} canEnter />
        ))}
      <Divider />
      <Typography variant={'subtitle1'}>Actieve</Typography>
      {groups
        .filter(g => !g.idle)
        .map(g => (
          <GroupElement key={g.id} group={g} />
        ))}
    </div>
  );
};
