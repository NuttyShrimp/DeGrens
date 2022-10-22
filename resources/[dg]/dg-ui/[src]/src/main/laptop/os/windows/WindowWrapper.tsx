import React, { CSSProperties, FC, useCallback, useEffect, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { useSelector } from 'react-redux';
import { store, useUpdateState } from '@src/lib/redux';

export const WindowWrapper: FC<{ activeApps: Laptop.State['activeApps']; focusedApp: Laptop.State['focusedApp'] }> = ({
  activeApps,
  focusedApp,
}) => {
  const appConfigs = useSelector<RootState, Laptop.Config.Config[]>(state => state['laptop.config'].enabledApps);
  const updateState = useUpdateState('laptop');
  const containerRef = useRef<HTMLDivElement>(null);

  // We store app position seperatly to allow smooth dragging, only updating to reduxstore on drop
  const [windowPositions, setWindowPosition] = useState<Laptop.State['windowPositions']>({});

  // On first render we fetch from store
  useEffect(() => {
    const startPositions = (store.getState() as RootState).laptop.windowPositions;
    setWindowPosition({ ...startPositions });
  }, []);

  const [, dropRef] = useDrop(
    () => ({
      accept: 'APP',
      hover: (item: { name: string }, monitor) => {
        if (!containerRef.current) return;
        const offset = containerRef.current.getBoundingClientRect();
        const dropPosition = monitor.getSourceClientOffset();
        if (!dropPosition) return;
        const newPosition = {
          x: dropPosition.x - offset.x,
          y: dropPosition.y - offset.y,
        };
        setWindowPosition(state => ({
          ...state,
          [item.name]: newPosition,
        }));
      },
      drop: (item: { name: string }) => {
        // We only update position to store on drop
        const newPosition = windowPositions[item.name];
        if (!newPosition) return;
        updateState(state => ({
          windowPositions: {
            ...state.laptop.windowPositions,
            [item.name]: newPosition,
          },
        }));
      },
    }),
    [containerRef.current, windowPositions]
  );
  dropRef(containerRef);

  const getWindowPosition = useCallback(
    (app: string): CSSProperties => {
      const appPosition = windowPositions[app] ?? { x: 100, y: 100 };
      return { transform: `translate(${appPosition.x}px, ${appPosition.y}px)` };
    },
    [windowPositions]
  );

  return (
    <div className={'laptop-content'} ref={containerRef}>
      {appConfigs.map(a => (
        <div
          key={`laptop-window-${a.name}`}
          style={{
            display: activeApps.includes(a.name) ? 'inline' : 'none',
            zIndex: a.important ? 10 : focusedApp === a.name ? 5 : 1,
            ...getWindowPosition(a.name),
          }}
        >
          {a.important && <div className='laptop-important' />}
          {a.render({})}
        </div>
      ))}
    </div>
  );
};
