import React, { FC, useCallback } from 'react';
import { Button } from '@src/components/button';
import { nuiAction } from '@src/lib/nui-comms';

import { useDispatchStore } from '../stores/useDispatchStore';

import { Call } from './call';

export const CallList: FC<{ newIds: string[]; onlyNew: boolean }> = ({ newIds, onlyNew }) => {
  const callList = useDispatchStore(s => s.calls);
  const loadMore = () => {
    nuiAction('dispatch/load', {
      offset: callList.length,
    });
  };

  const getCalls = useCallback(
    (onlyNew = false) => callList.filter(c => (onlyNew ? newIds.includes(c.id) : !newIds.includes(c.id))),
    [callList, newIds]
  );

  return (
    <div className='dispatch-list dispatch-call-list'>
      {getCalls(true).map(c => (
        <Call key={c.id} call={c} isNew={true} />
      ))}
      {!onlyNew && (
        <>
          {getCalls().map(c => (
            <Call key={c.id} call={c} isNew={false} />
          ))}
          <div className='center'>
            <Button.Primary onClick={loadMore}>Laad meer</Button.Primary>
          </div>
        </>
      )}
    </div>
  );
};
