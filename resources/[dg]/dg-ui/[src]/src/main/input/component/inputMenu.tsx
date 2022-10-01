import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button } from '@components/button';
import { Input } from '@components/inputs';
import { Typography } from '@mui/material';

import { closeApplication } from '../../../components/appwrapper';
import { nuiAction } from '../../../lib/nui-comms';
import store from '../store';

export const InputMenu: FC<InputMenu.Data> = props => {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    setValues(
      props.inputs.reduce((acc, input) => {
        acc[input.name] = input.value;
        return acc;
      }, {})
    );
  }, [props.inputs]);

  const handleChange = useCallback(
    (val: string, name: string) => {
      setValues(vals => ({
        ...vals,
        [name]: val,
      }));
    },
    [setValues]
  );

  const handleClick = (accepted: boolean) => {
    nuiAction(props.callbackURL, { values, accepted });
    closeApplication(store.key);
  };

  return (
    <div className={'inputmenu__wrapper'}>
      <div className={'inputmenu__header'}>
        <Typography variant='body1' style={{ whiteSpace: 'pre-line' }}>
          {props.header}
        </Typography>
      </div>
      <div className={'inputmenu__collection'}>
        {props.inputs.map(i => {
          switch (i.type) {
            case 'text':
              return <Input.TextField key={i.name} {...i} value={values[i.name] ?? ''} onChange={handleChange} />;
            case 'number':
              return <Input.Number key={i.name} {...i} value={values[i.name] ?? ''} onChange={handleChange} />;
            case 'password':
              return <Input.Password key={i.name} {...i} value={values[i.name] ?? ''} onChange={handleChange} />;
            case 'select':
              return (
                <Input.AutoComplete
                  key={i.name}
                  {...i}
                  options={i.options}
                  value={values[i.name] ?? ''}
                  onChange={handleChange}
                />
              );
            default:
              return null;
          }
        })}
      </div>
      <div className={'inputmenu__btns'}>
        <Button.Secondary onClick={() => handleClick(false)}>Decline</Button.Secondary>
        <Button.Primary onClick={() => handleClick(true)}>Accept</Button.Primary>
      </div>
    </div>
  );
};
