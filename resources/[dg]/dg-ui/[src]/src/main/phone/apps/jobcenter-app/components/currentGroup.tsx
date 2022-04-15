import React, { FC, useEffect, useState } from 'react';
import { Button } from '@src/components/button';
import { Paper } from '@src/components/paper';
import { Loader } from '@src/components/util';
import { nuiAction } from '@src/lib/nui-comms';

export const CurrentGroup: FC<Omit<Phone.JobCenter.Props, 'groups' | 'jobs'>> = props => {
  const [owner, setOwner] = useState<Phone.JobCenter.Member | undefined>(undefined);

  useEffect(() => {
    setOwner(props.groupMembers.find(m => m.isOwner));
  }, [props]);

  const toggleSetReady = () => {
    nuiAction('phone/jobs/group/setReady', {
      ready: !props.isReady,
    });
    props.updateState({
      isReady: !props.isReady,
    });
  };

  const handleGroupLeave = () => {
    nuiAction('phone/jobs/groups/leave');
  };

  if (!owner) return <Loader />;

  return (
    <div className='jobcenter__currentgroup'>
      <div className='jobcenter__currentgroup__owner'>
        <Paper title={owner.name} image='user-crown' notification={!owner.ready} />
      </div>
      <div className='jobcenter__currentgroup__members'>
        {props.groupMembers
          .filter(m => m.name !== owner?.name)
          .map(m => (
            <Paper
              key={m.name}
              title={m.name}
              notification={!m.ready}
              image={'user'}
              actions={
                props.isOwner
                  ? [
                      {
                        icon: 'user-slash',
                        title: 'Kick',
                        onClick: () =>
                          nuiAction('phone/jobs/groups/kick', {
                            name: m.name,
                          }),
                      },
                    ]
                  : []
              }
            />
          ))}
      </div>
      <div className='jobcenter__currentgroup__buttons'>
        <Button.Primary onClick={toggleSetReady}>{props.isReady ? 'Set unready' : 'Set ready'}</Button.Primary>
        <Button.Secondary onClick={handleGroupLeave}>Leave group</Button.Secondary>
      </div>
    </div>
  );
};
