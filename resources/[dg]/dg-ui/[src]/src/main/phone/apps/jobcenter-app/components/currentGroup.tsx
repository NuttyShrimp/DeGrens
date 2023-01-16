import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@src/components/button';
import { Paper } from '@src/components/paper';
import { Loader } from '@src/components/util';
import { nuiAction } from '@src/lib/nui-comms';
import { useMainStore } from '@src/lib/stores/useMainStore';

import { useJobcenterAppStore } from '../stores/useJobcenterAppStore';

export const CurrentGroup = () => {
  const [owner, setOwner] = useState<Phone.JobCenter.Member | undefined>(undefined);
  const ownCid = useMainStore(s => s.character.cid);
  const [groupMembers, isOwner] = useJobcenterAppStore(s => [s.groupMembers, s.isOwner]);

  useEffect(() => {
    setOwner(groupMembers.find(m => m.isOwner));
  }, [groupMembers]);

  const toggleSetReady = () => {
    nuiAction('phone/jobs/group/setReady', {
      ready: !isReady,
    });
  };

  const handleGroupLeave = () => {
    nuiAction('phone/jobs/groups/leave');
  };

  const isReady = useMemo(
    () => groupMembers.find(member => member.cid === ownCid)?.ready ?? false,
    [groupMembers, ownCid]
  );

  if (!owner) return <Loader />;

  return (
    <div className='jobcenter__currentgroup'>
      <div className='jobcenter__currentgroup__owner'>
        <Paper title={owner.name} image='user-crown' notification={!owner.ready} />
      </div>
      <div className='jobcenter__currentgroup__members'>
        {groupMembers
          .filter(m => m.name !== owner?.name)
          .map(m => (
            <Paper
              key={m.name}
              title={m.name}
              notification={!m.ready}
              image={'user'}
              actions={
                isOwner
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
        <Button.Primary onClick={toggleSetReady}>{isReady ? 'Set unready' : 'Set ready'}</Button.Primary>
        <Button.Secondary onClick={handleGroupLeave}>Leave group</Button.Secondary>
      </div>
    </div>
  );
};
