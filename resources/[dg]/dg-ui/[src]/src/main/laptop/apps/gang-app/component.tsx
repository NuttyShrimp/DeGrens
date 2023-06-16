import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Divider, Tooltip } from '@mui/material';
import { devData } from '@src/lib/devdata';
import { nuiAction } from '@src/lib/nui-comms';

import { AppWindow } from '../../os/windows/AppWindow';

import { Feed } from './pages/feed';
import { Home } from './pages/home';
import { MemberList } from './pages/memberlist';
import { useGangApp } from './stores/useGangAppStore';
import config from './config';

import '../../styles/gang.scss';

// First one gets used as startingpage
const TABS: Record<Laptop.Gang.Tab, { label: string; requiredPerms: boolean }> = {
  home: { label: 'info', requiredPerms: false },
  members: { label: 'leden', requiredPerms: true },
  feed: { label: 'feed', requiredPerms: false },
};

export const Component: FC = () => {
  const [activeTab, setActiveTab] = useState<Laptop.Gang.Tab>(Object.keys(TABS)[0] as Laptop.Gang.Tab);
  const [updateStore, members, label, name] = useGangApp(s => [s.updateStore, s.members, s.label, s.name]);
  const [hasGang, setHasGang] = useState(false);

  const playerMember = useMemo(() => {
    return members.find(m => m.isPlayer);
  }, [members]);

  const fetchGangData = useCallback(async () => {
    // Serialization changes null to undefined yey
    const result = await nuiAction<Laptop.Gang.State | undefined>('laptop/gang/fetch', {}, devData.laptopGang);
    setHasGang(result != undefined);
    if (result == undefined) return;
    updateStore(result);
  }, []);

  useEffect(() => {
    fetchGangData();
  }, []);

  const active = useMemo(() => {
    switch (activeTab) {
      case 'home':
        return (
          <Home label={label} gangName={name} fetchGangData={fetchGangData} isOwner={playerMember?.isOwner ?? false} />
        );
      case 'members':
        return <MemberList gangName={name} members={members} fetchGangData={fetchGangData} />;
      case 'feed':
        return <Feed />;
      default:
        return null;
    }
  }, [activeTab, name, members]);

  if (active === null) return null;

  return (
    <AppWindow width={70} height={55} name={config.name} title={config.label}>
      <div className='laptop-gang'>
        {hasGang ? (
          <div className='app'>
            <div className='tabs'>
              {(Object.keys(TABS) as Laptop.Gang.Tab[]).map(name => {
                if (TABS[name].requiredPerms && !playerMember?.hasPerms) return;
                return (
                  <Button
                    key={`gang-app-tab-${name}`}
                    variant='outlined'
                    onClick={() => setActiveTab(name)}
                    color={'secondary'}
                    size='small'
                  >
                    {TABS[name].label}
                  </Button>
                );
              })}
              <div className='refresh' onClick={fetchGangData}>
                <Tooltip title='Refresh'>
                  <i className={'fas fa-arrows-rotate'} />
                </Tooltip>
              </div>
            </div>
            <Divider />
            <div className='content'>{active}</div>
          </div>
        ) : (
          <div className='notfound'>
            <p>{'Je hoort nergens bij :('}</p>
          </div>
        )}
      </div>
    </AppWindow>
  );
};
