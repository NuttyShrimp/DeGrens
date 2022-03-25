import React, { FC, useEffect, useState } from 'react';
import { useVhToPixel, vhToPixel } from '@lib/hooks/useVhToPixel';

import { CircleLocation, circleToBeSkipped, hudColors } from '../../enum';
import { styles, stylesBaseProps } from '../hud.styles';

import { HudCircle } from './circle';
import { HudIcons } from './icons';
import { HudVoice } from './voice';

export const HudCircles: FC<{ values: Hud.State['values']; iconIdx: number }> = props => {
  const circleHeight = useVhToPixel(17);
  // 0 = first extra circle, ...
  // Index of array = amount of circles from the center circles(health, armor)
  // Key = Object with key = circleType, value = location
  const [circleLocByIndent, setCircleLocByIndent] = useState<Record<string, Hud.HudCircleType>[]>([]);
  const classes = styles({ ...stylesBaseProps, extraCirc: circleLocByIndent.length });

  useEffect(() => {
    const vals: string[][] = [];
    let curIdx = 0;
    Object.keys(props.values).forEach(key => {
      if (circleToBeSkipped.includes(key)) return;
      if (!vals[curIdx]) {
        vals[curIdx] = [];
      }
      if (!props.values[key].enabled) return;
      vals[curIdx].push(key);
      if (vals[curIdx].length === 4) {
        curIdx++;
      }
    });

    const locVals: Record<string, Hud.HudCircleType>[] = [];
    vals.forEach((circle, idx) => {
      const loc = CircleLocation[circle.length];
      if (!loc) return;
      circle.forEach((key, circleIdx) => {
        if (!locVals[idx]) {
          locVals[idx] = {};
        }
        locVals[idx][key] = loc[circleIdx];
      });
    });
    setCircleLocByIndent(locVals);
  }, [props.values]);

  return (
    <div className={classes.hudOuterCircle}>
      <HudIcons circleLocByIndent={circleLocByIndent} idx={props.iconIdx} />
      <HudVoice baseSize={circleHeight} indentAm={circleLocByIndent.length} />
      <div
        className={classes.hudInnerWrapper}
        style={{
          maxHeight: `${circleHeight}px`,
        }}
      >
        <HudCircle
          type={'left'}
          sx={{
            color: hudColors.health,
          }}
          value={props.values.health.value}
          size={circleHeight}
          indent={-1}
        />
        <HudCircle
          type={'right'}
          sx={{
            color: hudColors.armor,
          }}
          value={props.values.armor.value}
          size={circleHeight}
          indent={-1}
        />
        {Object.entries(circleLocByIndent).map(([indent, circles]) =>
          Object.entries(circles).map(([valName, loc]) => {
            if (!props?.values?.[valName]?.enabled) return null;
            return (
              <HudCircle
                key={`${indent}-${valName}`}
                type={loc}
                sx={{
                  color: hudColors[valName],
                }}
                value={props.values[valName].value}
                size={circleHeight + vhToPixel(Number(indent + 1) * 2)}
                indent={Number(indent)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
