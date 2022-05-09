import React, { FC, useState } from 'react';
import { CircularProgress } from '@mui/material';

import { copyToClipboard } from '../lib/util';
import { setBigPhoto } from '../main/phone/lib';
import { styles } from '../styles/components/imagecontainer.styles';

export const Imagecontainer: FC<
  React.PropsWithChildren<{
    url: string;
    loading: boolean;
  }>
> = props => {
  const [isClicked, setIsClicked] = useState(false);
  const classes = styles();

  const handleShowBig = () => {
    if (props.loading || !isClicked) return;
    setBigPhoto(props.url);
  };

  const handleHideBig = () => {
    setBigPhoto(null);
  };

  return (
    <div className={classes.root}>
      {isClicked && (
        <span className={classes.hideSpan} onClick={() => setIsClicked(false)}>
          Click here to hide the image
        </span>
      )}
      <div className={classes.wrapper} onMouseEnter={handleShowBig} onMouseLeave={handleHideBig}>
        {props.loading ? (
          <div className={classes.spinner}>
            <CircularProgress color={'inherit'} />
          </div>
        ) : isClicked ? (
          <div onClick={() => copyToClipboard(props.url)}>
            <img src={props.url} alt='image' />
          </div>
        ) : (
          <div className={classes.hidden} onClick={() => setIsClicked(true)}>
            <i className='fas fa-eye-slash'></i>
            <p>Click to view this image</p>
          </div>
        )}
      </div>
    </div>
  );
};
