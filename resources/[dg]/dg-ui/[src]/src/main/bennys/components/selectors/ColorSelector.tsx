import { FC, useCallback, useEffect, useState } from 'react';
import { modulo } from '@src/lib/util';

import { getRGBOfColor } from '../../data/gtacolors';
import { useGuide } from '../../hooks/useInformationBar';
import { useKeyEvents } from '../../hooks/useKeyEvents';
import { ColorPicker } from '../ColorPickers/ColorPicker';
import { GTAColorPicker } from '../ColorPickers/GTAColorPicker';
import { RGBSliders } from '../RGBSliders/RGBSliders';

export const ColorSelector: FC<Bennys.ColorSelector.Props> = props => {
  const { showGuide, hideGuide } = useGuide({
    title: 'Switch Menu Type',
    kbdCombo: ['Space'],
  });
  const { useEventRegister } = useKeyEvents();
  const [currentPickerType, setCurrentPickerType] = useState<number>();

  // Start on picker where selected cartitem is
  useEffect(() => {
    const picker = typeof props.value === 'number' ? 2 : 1;
    setCurrentPickerType(picker);
  }, [props.category]);

  const cyclePickerType = useCallback(() => {
    setCurrentPickerType(current => modulo((current ?? 0) + 1, 3));
  }, []);
  useEventRegister(' ', cyclePickerType);

  useEffect(() => {
    showGuide();
    return () => {
      hideGuide();
    };
  }, []);

  switch (currentPickerType) {
    case 0:
      return <ColorPicker {...{ ...props, value: getRGBOfColor(props.value) }} />;
    case 1:
      return <RGBSliders {...{ ...props, value: getRGBOfColor(props.value) }} />;
    case 2:
      return <GTAColorPicker {...{ ...props, value: getRGBOfColor(props.value) }} />;
    default:
      return null;
  }
};
