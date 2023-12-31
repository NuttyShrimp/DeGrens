import { FC, useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { Tooltip } from '@mui/material';
import { red } from '@mui/material/colors';

import { emptyFn } from '../lib/util';
import { styles } from '../styles/components/paper.styles';

import { Icon } from './icon';

export const Paper: FC<React.PropsWithChildren<Paper.Props>> = props => {
  const [showActions, setShowActions] = useState(false);
  const [imgOnly, setImgOnly] = useState(false);
  const [showExtDescription, setShowExtDescription] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const classes = styles();

  useEffect(() => {
    setImgOnly(!props.title && !props.description);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (props.onClick) {
      props.onClick(e);
    }
    setShowExtDescription(!showExtDescription);
  };

  return (
    <div
      className={[
        classes.root,
        imgOnly ? 'imgonly' : '',
        showExtDescription ? 'extended' : '',
        props.actions ? 'keepBackground' : '',
        'bordered-div',
      ].join(' ')}
      ref={rootRef}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={handleClick}
      style={{
        cursor: props.onClick ? 'pointer' : 'default',
        borderBottomColor: props.notification ? red[700] : 'inherit',
      }}
    >
      <div className={classes.details}>
        <div className={classes.innerDetails}>
          {props.image && (
            <div className={'paper-image'}>
              {typeof props.image === 'string' ? <Icon name={props.image} size={'2.25rem'} /> : props.image}
            </div>
          )}
          {(props.title || props.description) && (
            <div className={classes.textWrapper}>
              {props.title && <div className={'paper-title'}>{props.title}</div>}
              {props.description && (!props.replaceDescription || !showExtDescription) && (
                <div className={`paper-description ${props.allowLongDescription ? 'wrap' : ''}`}>
                  {typeof props.description === 'string' ? <span>{props.description}</span> : props.description}
                </div>
              )}
            </div>
          )}
        </div>
        {props.extDescription && showExtDescription && (
          <div className={classes.extDescription}>
            {typeof props.extDescription === 'string' ? <span>{props.extDescription}</span> : props.extDescription}
          </div>
        )}
      </div>
      {showActions && props?.actions && props.actions.length > 0 && (
        <div className={classes.actionList}>
          {props.actions.map((a, i) => (
            <Tooltip arrow key={i} title={a.title} placement={'bottom'}>
              <div className={classes.actionEntry} onClick={a.onClick ? () => a.onClick(a.data) : emptyFn}>
                <Icon name={a.icon} />
              </div>
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  );
};
