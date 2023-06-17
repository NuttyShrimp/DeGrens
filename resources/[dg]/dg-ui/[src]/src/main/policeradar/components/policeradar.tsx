import { FC } from 'react';

export const Policeradar: FC<{
  currentSpeed: string;
  topSpeed: string;
  plate: string;
  flagged: boolean;
  locked: boolean;
}> = props => {
  return (
    <div className='policeradar'>
      <div className='container'>
        <p>{props.currentSpeed}</p>
        <p>speed</p>
      </div>
      <div className='container'>
        <p>{props.topSpeed}</p>
        <p>topspeed</p>
      </div>
      <div className={`container ${props.flagged ? 'flagged' : ''}`}>
        <p>{props.plate}</p>
        <p>plate{props.locked ? ' - locked' : ''}</p>
      </div>
    </div>
  );
};
