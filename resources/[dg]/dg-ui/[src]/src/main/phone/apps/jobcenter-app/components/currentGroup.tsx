import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@src/components/button';
import { Paper } from '@src/components/paper';
import { Loader } from '@src/components/util';
import { nuiAction } from '@src/lib/nui-comms';

export const CurrentGroup: AppFunction<Omit<Phone.JobCenter.State, 'groups' | 'jobs'>> = props => {
  const [owner, setOwner] = useState<Phone.JobCenter.Member | undefined>(undefined);
  const ownCid = useSelector<RootState, number>(state => state.character.cid);

  useEffect(() => {
    setOwner(props.groupMembers.find(m => m.isOwner));
  }, [props]);

  const toggleSetReady = () => {
    nuiAction('phone/jobs/group/setReady', {
      ready: !isReady,
    });
  };

  const handleGroupLeave = () => {
    nuiAction('phone/jobs/groups/leave');
  };

  const isReady = useMemo(
    () => props.groupMembers.find(member => member.cid === ownCid)?.ready ?? false,
    [props.groupMembers, ownCid]
  );

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
        <Button.Primary onClick={toggleSetReady}>{isReady ? 'Set unready' : 'Set ready'}</Button.Primary>
        <Button.Secondary onClick={handleGroupLeave}>Leave group</Button.Secondary>
      </div>
    </div>
  );
};
