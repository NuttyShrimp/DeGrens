import { FC } from 'react';
import { useConfigmenuStore } from '@src/main/configmenu/stores/useConfigmenuStore';

import defaultWallpaper from '../../../assets/laptop/wallpaper.jpg';
import { useLaptopStore } from '../stores/useLaptopStore';

import { WindowWrapper } from './windows/WindowWrapper';
import { Background } from './Background';
import { Notifications } from './Notifications';
import { TaskBar } from './Taskbar';

// Inspired by https://www.reddit.com/r/unixporn/comments/xbke0w/gnome_welcome_to_the_rice_field_mtf/
export const Laptop: FC = () => {
  const configBG = useConfigmenuStore(s => s.phone.background.laptop);
  const [activeApps, focusedApp] = useLaptopStore(s => [s.activeApps, s.focusedApp]);

  return (
    <div
      className={'laptop-shell'}
      style={{
        backgroundImage: `url(${configBG.trim() === '' ? defaultWallpaper : configBG})`,
      }}
    >
      <Background />
      <WindowWrapper activeApps={activeApps} focusedApp={focusedApp} />
      <TaskBar activeApps={activeApps} />
      <Notifications />
    </div>
  );
};
