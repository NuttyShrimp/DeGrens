import { useCallback, useEffect, useMemo, useState } from 'react';
import AppWrapper, { closeApplication } from '@src/components/appwrapper';
import { nuiAction } from '@src/lib/nui-comms';
import { useVisibleStore } from '@src/lib/stores/useVisibleStore';

import config from './_config';
import { ARROW_COLORS, DEFAULT_PATH, KEYCODE_TO_DIRECTION, PATH_LENGTH } from './constants';
import { generatePath, getRandomDirection, toLength } from './helpers';

import './styles/keygame.scss';

const Component: AppFunction = props => {
  const visible = useVisibleStore(s => s.visibleApps.includes('keygame'));
  const [currectCycle, setCurrentCycle] = useState<number | null>(null);

  const [percentage, setPercentage] = useState(0);
  const [target, setTarget] = useState<Keygame.Target>({ start: 0, end: 0 });
  const [arrowColor, setArrowColor] = useState<Keygame.ArrowColor>('normal');
  const [direction, setDirection] = useState<Keygame.Direction>('up');
  const [id, setId] = useState('');
  const [cycles, setCycles] = useState<Keygame.Cycle[]>([]);

  const [keyPressed, setKeypressed] = useState<string | null>(null);

  const handleFinish = useCallback(
    (success: boolean) => {
      setCurrentCycle(null);
      setArrowColor(success ? 'success' : 'fail');
      setTimeout(() => {
        nuiAction('keygame/finished', { id: id, success });
        closeApplication(config.name);
      }, 500);
    },
    [closeApplication, id]
  );

  // Keypress handler
  useEffect(() => {
    if (currectCycle === null) return;
    if (keyPressed === null) return;
    setKeypressed(null);

    const pressedDirection = KEYCODE_TO_DIRECTION[keyPressed];
    if (!pressedDirection) return;

    const success = percentage >= target.start && percentage <= target.end && direction === pressedDirection;

    if (!success || cycles.length - 1 === currectCycle) {
      handleFinish(success);
      return;
    }

    setCurrentCycle(currectCycle + 1);
  }, [keyPressed]);

  // Handle keypress listener
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      setKeypressed(e.code);
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [visible]);

  // Handles cycle
  useEffect(() => {
    if (currectCycle === null) return;

    const cycle = cycles[currectCycle];
    if (!cycle) return;

    // Generate center of targetarea, minimum is 45 + half of size, maximum is 95 - half of size
    // For example for size 20, the center will be between 55 and 85
    const center =
      Math.round(
        Math.floor(Math.random() * (95 - cycle.size / 2 - (45 + cycle.size / 2)) + (45 + cycle.size / 2)) * 10
      ) / 10;
    setTarget({
      start: center - cycle.size / 2,
      end: center + cycle.size / 2,
    });

    setPercentage(0);
    setDirection(getRandomDirection());
    props.showApp();

    // Animation logic
    let currentPercentage = 0;
    const increase = 0.1 * cycle.speed;
    const thread = setInterval(() => {
      if (currentPercentage >= 100) {
        clearInterval(thread);
        handleFinish(false);
        return;
      }
      currentPercentage += increase;
      setPercentage(currentPercentage);
    }, 10);

    return () => {
      clearInterval(thread);
    };
  }, [currectCycle]);

  const handleShow = useCallback((data: Keygame.Open) => {
    setId(data.id);
    setArrowColor('normal');
    setKeypressed(null);
    setCycles(data.cycles);
    setCurrentCycle(0);
  }, []);

  const handleHide = useCallback(() => {
    props.hideApp();
    setCycles([]);
    setId('');
  }, []);

  const targetPath = useMemo(() => generatePath(target.start, target.end), [target.start, target.end]);

  return (
    <AppWrapper appName={config.name} onShow={handleShow} onHide={handleHide} full>
      <div className='keygame_wrapper'>
        <svg className='arch' viewBox='0 -4.644660949707031 90.710678118655 34.644660949707031'>
          <path className='background' d={DEFAULT_PATH} />
          <path className='target' d={targetPath} />
          <path
            className='fill'
            d={DEFAULT_PATH}
            style={{ strokeDasharray: PATH_LENGTH, strokeDashoffset: toLength(percentage) }}
          />
        </svg>
        <i className={`fas fa-arrow-${direction}`} style={{ color: ARROW_COLORS[arrowColor] }}></i>
      </div>
    </AppWrapper>
  );
};

export default Component;
