import React, { FC, useCallback } from 'react';
import { Button } from '@src/components/button';
import { nuiAction } from '@src/lib/nui-comms';

import { Call } from './call';

export const CallList: FC<{ list: Dispatch.Call[]; newIds: string[]; onlyNew: boolean }> = ({
  list,
  newIds,
  onlyNew,
}) => {
  const loadMore = () => {
    nuiAction('dispatch/load', {
      offset: list.length,
    });
  };

  const getCalls = useCallback(
    (onlyNew = false) => list.filter(c => (onlyNew ? newIds.includes(c.id) : !newIds.includes(c.id))),
    [list, newIds]
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
