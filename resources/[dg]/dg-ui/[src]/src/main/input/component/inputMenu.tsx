import React, { useEffect, useState } from 'react';
import { Button } from '@components/button';
import { Input } from '@components/inputs';
import { Typography } from '@mui/material';

import { closeApplication } from '../../../components/appwrapper';
import { nuiAction } from '../../../lib/nui-comms';
import store from '../store';

export const InputMenu: AppFunction<InputMenu.State> = props => {
  const [values, setValues] = useState({});

  useEffect(() => {
    const _values = {};
    props.inputs.forEach(input => {
      _values[input.name] = input.value ?? '';
    });
    setValues(_values);
  }, [props.inputs]);

  const handleChange = (val: string, name: string) => {
    if (values[name] === undefined) {
      throw new Error(`Input ${name} does not exist`);
    }
    setValues({
      ...values,
      [name]: val,
    });
  };

  const handleSubmit = () => {
    nuiAction(props.callbackURL, {
      values,
    });
    setValues({});
    closeApplication(store.key);
  };

  return (
    <div className={'inputmenu__wrapper'}>
      {props.header && (
        <div className={'inputmenu__'}>
          <Typography>{props.header}</Typography>
        </div>
      )}
      <div className={'inputmenu__collection'}>
        {props.inputs.map(i => {
          switch (i.type) {
            case 'number':
              return <Input.Number key={i.name} {...i} value={values[i.name]} onChange={handleChange} />;
            case 'password':
              return <Input.Password key={i.name} {...i} value={values[i.name]} onChange={handleChange} />;
            case 'select':
              return (
                <Input.AutoComplete
                  key={i.name}
                  {...i}
                  options={i.options ?? []}
                  value={values[i.name]}
                  onChange={handleChange}
                />
              );
            default:
              return <Input.TextField key={i.name} {...i} value={values[i.name]} onChange={handleChange} />;
          }
        })}
      </div>
      <div className={'inputmenu__btns'}>
        <Button.Secondary onClick={() => closeApplication(store.key)}>Decline</Button.Secondary>
        <Button.Primary onClick={handleSubmit}>Accept</Button.Primary>
      </div>
    </div>
  );
};
