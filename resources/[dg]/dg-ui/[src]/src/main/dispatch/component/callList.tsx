import React, { FC } from 'react';
import { Button } from '@src/components/button';
import { nuiAction } from '@src/lib/nui-comms';

import { Call } from './call';

export const CallList: FC<{ list: Dispatch.Call[]; viewedIds: string[]; onlyNew: boolean }> = ({
  list,
  viewedIds,
  onlyNew,
}) => {
  const loadMore = () => {
    nuiAction('dispatch/load', {
      offset: list.length,
    });
  };

  return (
    <div className='dispatch-list dispatch-call-list'>
      {list
        .filter(c => !viewedIds.includes(c.id))
        .map(c => (
          <Call key={c.id} call={c} isNew={true} />
        ))}
      {!onlyNew && (
        <>
          {list
            .filter(c => viewedIds.includes(c.id))
            .map(c => (
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
