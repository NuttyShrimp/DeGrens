import React from 'react';
import { TextareaAutosize, Typography } from '@mui/material';

import { useDebugLogStore } from '../stores/useDebugLogStore';

export const Log: React.FC<React.PropsWithChildren<{ log: DebugLogs.log }>> = props => {
  return (
    <div className={`log__entry ${props.log.isOk ? '' : 'red'}`}>
      <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
        {props.log.name}
      </Typography>
      <Typography variant='body2'>Body</Typography>
      <Typography variant='body2'>
        <TextareaAutosize
          value={JSON.stringify(props.log.body, null, 2)}
          minRows={3}
          maxRows={10}
          readOnly
          style={{ font: 'inherit', width: '100%' }}
        />
      </Typography>
      <Typography variant='body2'>Response</Typography>
      <Typography variant='body2'>
        <TextareaAutosize
          value={JSON.stringify(props.log.response, null, 2)}
          minRows={3}
          maxRows={10}
          readOnly
          style={{ font: 'inherit', width: '100%' }}
        />
      </Typography>
    </div>
  );
};

export const LogList = () => {
  const logs = useDebugLogStore(s => s.logs.slice(0, 20));
  return (
    <div className={'log__list'}>
      {logs.map((log, i) => (
        <Log log={log} key={`debuglogs-${log.id}-${i}`} />
      ))}
    </div>
  );
};
