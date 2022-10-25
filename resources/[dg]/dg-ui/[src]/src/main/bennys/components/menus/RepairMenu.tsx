import React, { FC, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { nuiAction } from '../../../../lib/nui-comms';
import { useGuide, useInformationBar } from '../../hooks/useInformationBar';
import { useKeyEvents } from '../../hooks/useKeyEvents';

import { MainMenuEntry } from './MainMenu';

import '../../styles/mainMenu.scss';

export const RepairMenu: FC<{}> = () => {
  const { showGuide, hideGuide } = useGuide({
    title: 'Repair Vehicle',
    kbdCombo: ['Enter'],
  });
  const { setTitle, resetTitle, setPrice } = useInformationBar();
  const { useEventRegister } = useKeyEvents();
  const repairPrice = useSelector<RootState, number>(state => state.bennys.currentCost);

  useEffect(() => {
    showGuide();
    setTitle('Repair');
    setPrice(repairPrice);
    return () => {
      resetTitle();
      hideGuide();
    };
  }, [repairPrice]);

  const repairVehicle = useCallback(() => {
    nuiAction('bennys:repairVehicle', {});
  }, []);
  useEventRegister('Enter', repairVehicle);

  const exitBennys = useCallback(() => {
    nuiAction('bennys:exit');
  }, []);
  useEventRegister('Escape', exitBennys);

  return (
    <div className={'bennys-main-menu'}>
      <MainMenuEntry title={'Reparatie Kosten'} selected />
    </div>
  );
};
