import { ReactComponent as EyeLogo } from '@assets/peek/eye.svg';
import { SvgIcon } from '@mui/material';

import { baseStyle } from '../../../base.styles';
import { usePeekStore } from '../stores/usePeekStore';

export const Eye = () => {
  const hasTarget = usePeekStore(s => s.hasTarget);
  return (
    <div className={'peek-eye'}>
      <SvgIcon
        sx={{
          color: hasTarget ? baseStyle.primary.normal : '#fff',
          fontSize: '3vh',
          filter: 'drop-shadow(0.2vh 0.2vh 0.2vh #000)',
        }}
        inheritViewBox={true}
        component={EyeLogo}
      />
    </div>
  );
};
