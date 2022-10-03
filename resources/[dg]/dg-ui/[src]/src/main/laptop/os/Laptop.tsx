import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import defaultWallpaper from '../../../assets/laptop/wallpaper.jpg';
import { useActions } from '../hooks/useActions';

import { Background } from './Background';
import { TaskBar } from './Taskbar';

// Inspired by https://www.reddit.com/r/unixporn/comments/xbke0w/gnome_welcome_to_the_rice_field_mtf/
export const Laptop: AppFunction<Laptop.State> = props => {
  const appConfigs = useSelector<RootState, Laptop.Config.Config[]>(state => state['laptop.config'].enabledApps);
  const { focusApp } = useActions();
  const configBG = useSelector<RootState, string>(state => state.configmenu.phone.background.laptop);

  const activeAppConfigs = useMemo(() => {
    return appConfigs.filter(a => props.activeApps.includes(a.name));
  }, [props.activeApps, appConfigs]);

  return (
    <div
      className={'laptop-shell'}
      style={{
        backgroundImage: `url(${configBG.trim() === '' ? defaultWallpaper : configBG})`,
      }}
    >
      <Background />
      <div className={'laptop-content'}>
        {activeAppConfigs.map(a => (
          <div
            key={a.name}
            style={{
              zIndex: props.focusedApp === a.name ? 5 : 1,
              top: `${a.top}vh`,
              left: `${a.left}vh`,
            }}
            onClick={() => focusApp(a.name)}
          >
            {a.render({})}
          </div>
        ))}
      </div>
      <TaskBar activeApps={props.activeApps} />
    </div>
  );
};
