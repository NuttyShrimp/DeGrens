import React, { FC } from 'react';

import { Icon } from '../../../../components/icon';
import { hudColors, hudIcons } from '../../enum';
import { styles, stylesBaseProps } from '../hud.styles';

export const HudIcons: FC<{ circleLocByIndent: Record<string, Hud.HudCircleType>[]; idx: number }> = ({
  idx,
  circleLocByIndent,
}) => {
  const classes = styles(stylesBaseProps);
  // TODO add state to visualize current icons
  return (
    <div className={classes.hudIcons}>
      {circleLocByIndent?.[0] &&
        ['left', 'right'].map(ori => {
          const filtered = Object.keys(circleLocByIndent[idx]).filter(
            c => circleLocByIndent[idx][c].replace(/-.*$/, '') === ori
          );
          return (
            <div
              key={`hud-icon-wrapper-${ori}`}
              className={`${ori}`}
              style={filtered.length === 1 ? { justifyContent: 'center' } : {}}
            >
              {filtered.map(
                circleName =>
                  circleLocByIndent[idx][circleName].replace(/-.*$/, '') === ori && (
                    <Icon
                      key={`hud-icon-${ori}-${circleName}`}
                      name={hudIcons[circleName].name}
                      lib={hudIcons[circleName]?.lib}
                      size={'1.5rem'}
                      style={{
                        textShadow: `-.2vh -.2vh 0px ${hudColors[circleName]}, .2vh .2vh 0px ${hudColors[circleName]}, -.2vh .2vh 0px ${hudColors[circleName]}, .2vh -.2vh 0px ${hudColors[circleName]}`,
                        mixBlendMode: 'lighten',
                      }}
                      color={'#00000070'}
                    />
                  )
              )}
            </div>
          );
        })}
    </div>
  );
};
