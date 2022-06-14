import React from 'react';
import { Badge, Divider, IconButton, Tooltip } from '@mui/material';

import { Icon } from '../../../../../components/icon';
import { JusticeNames } from '../../../enum';
import { startPhoneCall } from '../../phone-app/lib';

import { styles } from './justice.styles';

export const Justice: AppFunction<Phone.Justice.Props> = props => {
  const classes = styles();
  return (
    <div>
      {Object.keys(props.list).map(k => (
        <div key={`phone-justice-${k}`}>
          <div className={classes.header}>{JusticeNames[k]}</div>
          <Divider />
          <div className={classes.body}>
            {props.list[k].map(e => (
              <div className={classes.entry} key={e.phone}>
                <div>
                  <Badge
                    color={e.available ? 'success' : 'error'}
                    sx={{ marginRight: '1.5vh', marginLeft: '1.25vh' }}
                    badgeContent=' '
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                  />
                  <span>{e.name}</span>
                </div>
                <div className='phone'>
                  <Tooltip title={'bel'} placement={'left'} onClick={() => startPhoneCall(e.phone)}>
                    <IconButton>{<Icon name={'phone'} size={'.9rem'} />}</IconButton>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
