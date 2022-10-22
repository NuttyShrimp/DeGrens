import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Divider } from '@mui/material';
import { devData } from '@src/lib/devdata';
import { nuiAction } from '@src/lib/nui-comms';
import { useUpdateState } from '@src/lib/redux';

import { AppWindow } from '../../os/windows/AppWindow';

import { Home } from './pages/home';
import { MemberList } from './pages/memberlist';
import config from './config';

import '../../styles/gang.scss';

// First one gets used as startingpage
const TABS: Record<Laptop.Gang.Tab, { label: string; requiredPerms: boolean }> = {
  home: { label: 'info', requiredPerms: false },
  members: { label: 'leden', requiredPerms: true },
};

export const Component: FC = () => {
  const [activeTab, setActiveTab] = useState<Laptop.Gang.Tab>(Object.keys(TABS)[0] as Laptop.Gang.Tab);
  const gangInfo = useSelector<RootState, Laptop.Gang.State>(state => state['laptop.gang']);
  const updateState = useUpdateState('laptop.gang');
  const cid = useSelector<RootState, number>(state => state.character.cid);
  const [hasGang, setHasGang] = useState(false);

  const playerMember = useMemo(() => {
    return gangInfo.members.find(m => m.cid === cid);
  }, [cid, gangInfo]);

  const fetchGangData = useCallback(async () => {
    const result = await nuiAction<Laptop.Gang.State | null>('laptop/gang/fetch', {}, devData.laptopGang);
    setHasGang(result !== null);
    if (result === null) return;
    updateState(result);
  }, []);

  useEffect(() => {
    fetchGangData();
  }, []);

  const active = useMemo(() => {
    switch (activeTab) {
      case 'home':
        return (
          <Home
            label={gangInfo.label}
            gangName={gangInfo.name}
            fetchGangData={fetchGangData}
            isOwner={playerMember?.isOwner ?? false}
          />
        );
      case 'members':
        return <MemberList members={gangInfo.members} fetchGangData={fetchGangData} />;
      default:
        return null;
    }
  }, [activeTab, gangInfo]);

  if (active === null || playerMember === undefined) return null;

  return (
    <AppWindow width={70} height={55} name='gang' title={config.label}>
      <div className='laptop-gang'>
        {hasGang ? (
          <div className='app'>
            <div className='tabs'>
              {(Object.keys(TABS) as Laptop.Gang.Tab[]).map(name => {
                if (TABS[name].requiredPerms && !playerMember.hasPerms) return;
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
