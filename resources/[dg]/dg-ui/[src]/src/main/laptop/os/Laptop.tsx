import React from 'react';
import { useSelector } from 'react-redux';

import defaultWallpaper from '../../../assets/laptop/wallpaper.jpg';

import { WindowWrapper } from './windows/WindowWrapper';
import { Background } from './Background';
import { Notifications } from './Notifications';
import { TaskBar } from './Taskbar';

// Inspired by https://www.reddit.com/r/unixporn/comments/xbke0w/gnome_welcome_to_the_rice_field_mtf/
export const Laptop: AppFunction<Laptop.State> = props => {
  const configBG = useSelector<RootState, string>(state => state.configmenu.phone.background.laptop);

  return (
    <div
      className={'laptop-shell'}
      style={{
        backgroundImage: `url(${configBG.trim() === '' ? defaultWallpaper : configBG})`,
      }}
    >
      <Background />
      <WindowWrapper activeApps={props.activeApps} focusedApp={props.focusedApp}></WindowWrapper>
      <TaskBar activeApps={props.activeApps} />
      <Notifications />
    </div>
  );
};
