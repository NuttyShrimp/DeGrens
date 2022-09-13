import React, { FC } from 'react';
import { animated, useSpring } from 'react-spring';
import { Stack } from '@mui/material';
import { baseStyle } from '@src/base.styles';
import { FillableIcon } from '@src/components/icon';
import { useVhToPixel } from '@src/lib/hooks/useVhToPixel';

export const Voice: FC<Hud.State['voice']> = ({ channel, range, active, onRadio }) => {
  const smallBox = useVhToPixel(4);
  const extBox = useVhToPixel(9 + String(channel).length / 2);
  const styles = useSpring({ width: channel > 0 ? extBox : smallBox });
  return (
    <animated.div style={styles}>
      <Stack alignItems={'center'} direction='row' className='hud-voice' spacing={1}>
        <FillableIcon
          name={channel ? 'walkie-talkie' : 'microphone'}
          height={4}
          value={Math.ceil((100 / 3) * range)}
          color={active ? (onRadio ? baseStyle.tertiary.normal : baseStyle.secondary.normal) : 'white'}
          duration={250}
        />
        {channel > 0 && <p>{channel} Mhz</p>}
      </Stack>
    </animated.div>
  );
};
