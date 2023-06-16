import { FC, useCallback, useMemo } from 'react';
import useMeasure from 'react-use-measure';

import { hexToRGB, modulo } from '../../../../lib/util';
import { useKeyEvents } from '../../hooks/useKeyEvents';
import { compareRGB } from '../../utils/rgbComparator';

export const AbstractColorPicker: FC<Bennys.ColorSelector.AbstractProps> = props => {
  const [measureRef, { width }] = useMeasure();
  const { useEventRegister } = useKeyEvents();

  const options = useMemo(() => {
    return props.options.reduce((acc, cur, index) => {
      const rgb = typeof cur === 'string' ? hexToRGB(cur) : cur;
      const x = Math.floor(index / props.rows);
      const y = index % props.rows;
      acc.push({ rgb, x, y });
      return acc;
    }, [] as { rgb: RGB; x: number; y: number }[]);
  }, [props.options, props.rows]);

  const grid = useMemo(() => {
    return options.reduce<RGB[][]>((acc, option) => {
      if (!acc[option.x]) acc[option.x] = [];
      acc[option.x][option.y] = option.rgb;
      return acc;
    }, []);
  }, [options]);

  const select = useCallback(() => {
    if (!props.onSelect) return;
    props.onSelect(props.type, props.value);
  }, [props.onSelect, props.type, props.value]);
  useEventRegister('Enter', select);

  // region Movement
  const move = useCallback(
    (offset: { x: number; y: number }) => {
      const selected = options.find(option => compareRGB(option.rgb, props.value));
      // if color is not grid (gta color in rgb color for example)
      if (!selected) {
        props.onChange(props.type, options[0].rgb);
        return;
      }
      const newPos = {
        x: modulo(selected.x + offset.x, grid.length),
        y: modulo(selected.y + offset.y, grid[0].length),
      };
      const color = options.find(option => newPos.x === option.x && newPos.y === option.y)?.rgb;
      if (!color) return;
      if (!props.onChange) return;
      props.onChange(props.type, color);
    },
    [options, grid, props.value, props.onChange, props.type]
  );

  const moveLeft = useCallback(() => {
    move({ x: -1, y: 0 });
  }, [move]);
  const moveRight = useCallback(() => {
    move({ x: 1, y: 0 });
  }, [move]);
  const moveUp = useCallback(() => {
    move({ x: 0, y: -1 });
  }, [move]);
  const moveDown = useCallback(() => {
    move({ x: 0, y: 1 });
  }, [move]);
  useEventRegister('ArrowLeft', moveLeft);
  useEventRegister('ArrowRight', moveRight);
  useEventRegister('ArrowUp', moveUp);
  useEventRegister('ArrowDown', moveDown);
  // endregion

  return (
    <div className={'bennys-colorpicker-wrapper'}>
      <div>
        <div
          className={'bennys-colorpicker-current'}
          style={{
            backgroundColor: `rgb(${props.value.r}, ${props.value.g}, ${props.value.b})`,
            width,
          }}
        />
      </div>
      <div className={'bennys-colorpicker-palette'}>
        {grid.map((colors, columnId) => (
          <div key={`bennys-color-${columnId}`} ref={measureRef}>
            {colors.map((color, rowId) => {
              return (
                <div
                  key={`bennys-color-${columnId}-${rowId}`}
                  className={compareRGB(color, props.value) ? 'bennys-colorpicker-highlighted' : undefined}
                  style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
