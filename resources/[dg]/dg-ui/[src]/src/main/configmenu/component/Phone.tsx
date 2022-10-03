import React from 'react';
import { useSelector } from 'react-redux';
import { setBackground } from '@src/main/phone/lib';

import { Input } from '../../../components/inputs';
import { useConfigActions } from '../hooks/useConfigActions';

import { Section } from './Utils';

export const Phone = () => {
  const { updateConfig } = useConfigActions();
  const state = useSelector<RootState, ConfigMenu.PhoneConfig>(state => state.configmenu.phone);
  return (
    <div>
      <Section title={'Background'}>
        <Input.TextField
          onChange={val => {
            updateConfig('phone', { background: { ...state.background, phone: val } });
            setBackground();
          }}
          value={state.background.phone}
          label={'Background URL'}
        />
        <Input.TextField
          onChange={val => {
            updateConfig('phone', { background: { ...state.background, laptop: val } });
          }}
          value={state.background.laptop}
          label={'Laptop Background URL'}
        />
      </Section>
      <Section title={'Notifications'}>
        <Input.Checkbox
          onChange={e => {
            updateConfig('phone', { notifications: { ...state.notifications, twitter: e.currentTarget.checked } });
          }}
          checked={state.notifications.twitter}
          label={'Enable twitter notifications'}
          name={'toggleTwitterNotifications'}
        />
      </Section>
    </div>
  );
};
