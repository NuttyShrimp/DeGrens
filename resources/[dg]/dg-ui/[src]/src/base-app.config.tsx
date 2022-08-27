import React, {
  createContext,
  FC,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useSelector } from 'react-redux';

export interface ConfigObject {
  name: keyof RootState;
  render: (p: any) => ReactElement<any, any>;
  type: 'passive' | 'interactive';
}

const appsContext = createContext<ConfigObject[]>([]);

export const AppsProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [apps, setApps] = useState<ConfigObject[]>([]);
  const mainState = useSelector<RootState, Main.State>(state => state.main);

  useEffect(() => {
    const components: ConfigObject[] = [];
    const importAll = r => {
      Object.keys(r).forEach(key => {
        const config = r[key].default;
        if (components.find(cmp => cmp.name == config.name)) {
          console.error(`Double config key detected: ${config.name}`);
          return;
        }
        components.push(config);
      });
    };
    importAll(import.meta.glob('./main/*/_config.tsx', { eager: true }));
    setApps(components);
  }, [mainState.mounted]);

  return <appsContext.Provider value={apps}>{children}</appsContext.Provider>;
};

export const useApps = () => {
  const apps = useContext(appsContext);
  const mainState = useSelector<RootState, Main.State>(state => state.main);
  const getAllApps = useCallback(() => apps, [apps]);
  const getApp = useCallback(
    (name: keyof RootState): ConfigObject | undefined => apps.find(a => a.name === name),
    [apps]
  );
  const getCurrentAppType = useCallback(() => {
    return apps.filter(a => a.name !== 'cli').find(a => a.name === mainState.currentApp)?.type;
  }, [mainState, apps]);
  return {
    getAllApps,
    getApp,
    getCurrentAppType,
  };
};
