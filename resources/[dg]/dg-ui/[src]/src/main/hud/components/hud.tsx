import React from 'react';
import { useSelector } from 'react-redux';
import { animated, useSpring } from 'react-spring';

import { HudCircles } from './hud/wrapper';
import { Compass } from './compass';
import { styles } from './hud.styles';

export const HudWrapper: React.FC<Hud.Props> = props => {
  const phoneState = useSelector<RootState, Phone.State>(state => state.phone);
  const classes = styles({ extraCirc: 0 });
  const hudWrapperStyles = useSpring({
    right: phoneState.animating || phoneState.hasNotifications ? '32vh' : '2vh',
  });
  return (
    <div className={classes.wrapper}>
      <div className={classes.compassWrapper}>
        <Compass {...props.compass} />
      </div>
      <animated.div className={classes.hudWrapper} style={hudWrapperStyles}>
        <HudCircles values={props.values} iconIdx={props.iconIdx} />
      </animated.div>
    </div>
  );
};
