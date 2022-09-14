import { FC } from 'react';
import { useSelector } from 'react-redux';
import { useUpdateState } from '@src/lib/redux';

// A small component which we use to seed our store and updater in for a given ConfigObject

export const AppContainer: FC<{ config: Pick<ConfigObject, 'name' | 'render'> }> = ({ config }) => {
  const store = useSelector<RootState, any>(state => state[config.name]);
  const updateState = useUpdateState(config.name);
  return config.render({ ...store, updateState });
};
