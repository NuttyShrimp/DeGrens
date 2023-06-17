import { FC, useCallback, useEffect } from 'react';

import { nuiAction } from '../../../../lib/nui-comms';
import { useGuide } from '../../hooks/useInformationBar';
import { useKeyEvents } from '../../hooks/useKeyEvents';
import { useBennyStore } from '../../stores/useBennyStore';

import { MainMenuEntry } from './MainMenu';

import '../../styles/mainMenu.scss';

export const RepairMenu: FC<{}> = () => {
  const { showGuide, hideGuide } = useGuide({
    title: 'Repair Vehicle',
    kbdCombo: ['Enter'],
  });
  const [setTitle, resetTitle, setPrice, repairPrice] = useBennyStore(s => [
    s.setBarTitle,
    s.resetTitleBar,
    s.setBarPrice,
    s.currentCost,
  ]);
  const { useEventRegister } = useKeyEvents();

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
