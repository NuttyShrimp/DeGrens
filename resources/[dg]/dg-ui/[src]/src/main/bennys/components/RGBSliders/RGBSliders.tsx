import { FC, useCallback, useEffect, useState } from 'react';

import { modulo } from '../../../../lib/util';
import { useKeyEvents } from '../../hooks/useKeyEvents';
import { clamp } from '../../utils/clamp';
import { hsvToHslString, hsvToRgb, rgbToHsv, round } from '../../utils/colorConverters';

import { Slider } from './Slider';

import '../../styles/rgbSliders.scss';

export const RGBSliders: FC<Bennys.ColorSelector.Props> = props => {
  const { useEventRegister } = useKeyEvents();
  const [currentSlider, setCurrentSlider] = useState<number>(0);
  const [hsv, setHsv] = useState<Bennys.RGBSliders.HSVColor>(rgbToHsv(props.value));

  const sliderUp = useCallback(() => {
    setCurrentSlider(modulo(currentSlider + 1, 3));
  }, [currentSlider]);

  const sliderDown = useCallback(() => {
    setCurrentSlider(modulo(currentSlider - 1, 3));
  }, [currentSlider]);

  useEventRegister('ArrowUp', sliderUp);
  useEventRegister('ArrowDown', sliderDown);

  const onChangeHue = (modifier: number) => {
    setHsv(hsv => ({
      ...hsv,
      h: round(
        clamp({
          value: hsv.h + modifier * 360,
          min: 0,
          max: 360,
        }),
        2
      ),
    }));
  };

  const onChangeSaturation = (modifier: number) => {
    setHsv(hsv => ({
      ...hsv,
      s: clamp({
        value: hsv.s + modifier * 100,
        min: 0,
        max: 100,
      }),
    }));
  };

  const onChangeBrightness = (modifier: number) => {
    setHsv(hsv => ({
      ...hsv,
      v: clamp({
        value: hsv.v + modifier * 100,
        min: 0,
        max: 100,
      }),
    }));
  };

  useEffect(() => {
    if (!props.onChange) return;
    props.onChange('custom', hsvToRgb(hsv));
  }, [hsv]);

  const select = useCallback(() => {
    if (!props.onSelect) return;
    props.onSelect('custom', hsvToRgb(hsv));
  }, [props.onSelect, hsv]);
  useEventRegister('Enter', select);

  return (
    <div className={'bennys-rgb-container'}>
      <div>
        <div
          className={'bennys-rgb-current'}
          style={{
            backgroundColor: `rgb(${props.value.r}, ${props.value.g}, ${props.value.b})`,
          }}
        />
      </div>
      <div className={'bennys-rgb-sliders'}>
        <Slider
          currentColor={`hsl(${hsv.h}, 100%, 50%)`}
          sliderColor={
            'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
          }
          active={currentSlider === 0}
          left={hsv.h / 360}
          onChange={(modifier: number) => onChangeHue(modifier)}
        />
        <Slider
          currentColor={hsvToHslString({ ...hsv, v: 100 })}
          sliderColor={`linear-gradient(to right, #fff, ${hsvToHslString({ h: hsv.h, s: 100, v: 100 })})`}
          active={currentSlider === 1}
          left={hsv.s / 100}
          onChange={(modifier: number) => onChangeSaturation(modifier)}
        />
        <Slider
          currentColor={hsvToHslString({ ...hsv })}
          sliderColor={`linear-gradient(to right, #000, ${hsvToHslString({ h: hsv.h, s: hsv.s, v: 100 })})`}
          active={currentSlider === 2}
          left={hsv.v / 100}
          onChange={(modifier: number) => onChangeBrightness(modifier)}
        />
      </div>
    </div>
  );
};
