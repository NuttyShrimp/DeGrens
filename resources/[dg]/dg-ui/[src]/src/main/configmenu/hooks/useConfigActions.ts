import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { nuiAction } from '../../../lib/nui-comms';
import { useUpdateState } from '../../../lib/redux';

export const useConfigActions = () => {
  const state = useSelector<RootState, ConfigMenu.State>(state => state.configmenu);
  const updateState = useUpdateState('configmenu');

  const updateConfig = <T extends ConfigMenu.Menu>(key: T, data: Partial<ConfigMenu.State[T]>) => {
    updateState({
      [key]: {
        ...state[key],
        ...data,
      },
    });
  };

  const saveConfig = useCallback(() => {
    // To implement
    nuiAction('configmenu/save', {
      data: {
        hud: state.hud,
        radio: state.radio,
        phone: state.phone,
      },
    });
  }, [state.hud, state.radio, state.phone]);

  return {
    updateConfig,
    saveConfig,
  };
};
