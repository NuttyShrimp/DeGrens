import { FC, isValidElement } from 'react';
import * as React from 'react';

import { usePhoneFormStore } from '../../stores/usePhoneFormStore';

import { styles } from './form.styles';

export const Form: FC<React.PropsWithChildren<unknown>> = () => {
  const classes = styles();
  const [visible, checkmark, element, warning] = usePhoneFormStore(s => [s.visible, s.checkmark, s.element, s.warning]);

  return (
    <div
      className={classes.forms}
      style={
        visible || checkmark
          ? {
              backgroundColor: '#00000090',
              pointerEvents: 'all',
            }
          : {
              backgroundColor: 'transparent',
              pointerEvents: 'none',
            }
      }
    >
      {visible && isValidElement(element) && <div>{element}</div>}
      {checkmark && (
        <div className={classes.checkmarkWrapper}>
          <svg className={classes.checkmark} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 52 52'>
            <circle className='checkmark__circle' cx='26' cy='26' r='25' fill='none' />
            <path className='checkmark__check' fill='none' d='M14.1 27.2l7.1 7.2 16.7-16.8' />
          </svg>
        </div>
      )}
      {warning && (
        <div className={classes.warningContainer}>
          <div className={classes.warning}>
            <span className={classes.warningBody}></span>
            <span className={classes.warningDot}></span>
          </div>
          <div>Oops, er is iets misgegaan!</div>
        </div>
      )}
    </div>
  );
};
