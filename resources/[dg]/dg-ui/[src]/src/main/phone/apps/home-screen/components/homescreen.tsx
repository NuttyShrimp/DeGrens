import React, { FC, useMemo, useState } from 'react';
import { Tooltip } from '@mui/material';

import { Icon } from '../../../../../components/icon';
import { isDevel } from '../../../../../lib/env';
import { ConfigObject, getPhoneApps } from '../../../config';
import { changeApp } from '../../../lib';
import { AppContainer } from '../../../os/appcontainer/appcontainer';

import { styles } from './homescreen.styles';

const AppIcon: FC<ConfigObject> = props => {
  const classes = styles();
  return (
    <Tooltip
      placement={'top'}
      arrow
      title={isDevel() ? `${props.name} | ${props.label} (${props.position})` : props.label}
    >
      <div
        className={classes.app}
        onClick={() => changeApp(props.name)}
        style={{
          color: props.icon?.color ?? 'white',
          background: `linear-gradient(transparent, ${props.icon.backgroundGradient ?? 'rgba(0, 0, 0, 0)'})`,
          backgroundColor: props.icon.background ?? '#000',
        }}
      >
        <Icon lib={props.icon.lib} name={props.icon.name} size={props.icon.size ?? '1.5rem'} />
      </div>
    </Tooltip>
  );
};
const EmptyIcon = () => {
  const classes = styles();
  return <div className={classes.app} style={{ background: 'none', boxShadow: 'none' }} />;
};

export const HomeScreen = () => {
  const [apps, setApps] = useState<any[]>([]);
  const classes = styles();
  useMemo(() => {
    const _apps = getPhoneApps().filter(c => !!c.icon && (c.hidden ? !c.hidden() : true));
    const missingAmount = 4 - (_apps.length % 4);
    missingAmount === 4 ? setApps(_apps) : setApps(_apps.concat(new Array(missingAmount).fill({ empty: true })));
  }, []);
  return (
    <AppContainer>
      <div className={classes.root}>
        {apps.map((a, i) => (a.empty ? <EmptyIcon key={i} /> : <AppIcon key={a.name} {...a} />))}
      </div>
    </AppContainer>
  );
};
