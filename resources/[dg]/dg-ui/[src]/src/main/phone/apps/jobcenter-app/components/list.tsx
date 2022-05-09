import React, { FC, useEffect } from 'react';
import { Button } from '@components/button';
import { Icon } from '@src/components/icon';
import { Paper } from '@src/components/paper';
import { devData } from '@src/lib/devdata';
import { nuiAction } from '@src/lib/nui-comms';
import { addNotification } from '@src/main/phone/lib';

export const List: FC<
  React.PropsWithChildren<State.BaseProps<Phone.JobCenter.State> & { groups: Phone.JobCenter.Group[] }>
> = props => {
  const fetchGroups = async () => {
    const groups = await nuiAction('phone/jobs/groups/get', {}, devData.jobGroups);
    props.updateState({
      groups,
    });
  };

  const handleRequestToJoin = (groupId: string) => {
    nuiAction('phone/jobs/groups/join', {
      id: groupId,
    });
    addNotification({
      id: 'phone-jobs-groups-join',
      title: 'jobcenter',
      description: 'wachten op toegang...',
      sticky: true,
      icon: 'jobcenter',
    });
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
      {props.groups.map(g => (
        <Paper
          title={g.name}
          description={
            <div className='jobcenter__groups__actions'>
              <div>
                <Icon name='sign-in-alt' size='1rem' onClick={() => handleRequestToJoin(g.id)} />
              </div>
              <div className='jobcenter__groups__actions__sizes'>
                <div>
                  <Icon name='users' size='1rem' />
                  <span>{g.limit}</span>
                </div>
                <div>
                  <Icon name='user' size='1rem' />
                  <span>{g.size}</span>
                </div>
              </div>
            </div>
          }
          key={g.id}
          image={'users'}
        />
      ))}
    </div>
  );
};
