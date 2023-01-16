import React, { FC, PropsWithChildren, useCallback, useMemo } from 'react';
import { Box } from '@mui/material';

import { useBennyStore } from '../../stores/useBennyStore';

import { CartMenu } from './CartMenu';
import { ColorMenu } from './ColorMenu';
import { ComponentsMenu } from './ComponentsMenu';
import { ExtrasMenu } from './ExtrasMenu';
import { MainMenu } from './MainMenu';
import { RepairMenu } from './RepairMenu';
import { WheelsMenu } from './WheelsMenu';

const HeightWrapper: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <Box height={'25vh'} width={'100vw'} position={'fixed'} top={'75vh'} left={0} zIndex={3}>
      {children}
    </Box>
  );
};

export const Menu = () => {
  const [setMenu, currentMenu] = useBennyStore(s => [s.setMenu, s.currentMenu]);
  const goToMainMenu = useCallback(() => {
    setMenu('main');
  }, [setMenu]);

  const component = useMemo(() => {
    switch (currentMenu) {
      case 'main': {
        return <MainMenu />;
      }
      case 'repair': {
        return <RepairMenu />;
      }
      case 'colors': {
        return <ColorMenu goToMainMenu={goToMainMenu} />;
      }
      case 'interior': {
        return <ComponentsMenu menuType='interior' goToMainMenu={goToMainMenu} />;
      }
      case 'exterior': {
        return <ComponentsMenu menuType='exterior' goToMainMenu={goToMainMenu} />;
      }
      case 'wheels': {
        return <WheelsMenu goToMainMenu={goToMainMenu} />;
      }
      case 'extras': {
        return <ExtrasMenu goToMainMenu={goToMainMenu} />;
      }
      case 'cart': {
        return <CartMenu goToMainMenu={goToMainMenu} />;
      }
      default:
        return null;
    }
  }, [currentMenu, goToMainMenu]);

  return <HeightWrapper>{component}</HeightWrapper>;
};
