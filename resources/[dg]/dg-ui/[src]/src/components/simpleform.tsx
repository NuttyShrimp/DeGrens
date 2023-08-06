import { FC, useEffect, useState } from 'react';
import * as React from 'react';
import { Typography } from '@mui/material';

import { hideFormModal } from '../main/phone/lib';
import { styles } from '../styles/components/simpleform.styles';

import { Button } from './button';

export const SimpleForm: FC<React.PropsWithChildren<SimpleForm.Form>> = props => {
  const classes = styles();
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [btnsDisabled, setBtnsDisabled] = useState(false);
  useEffect(() => {
    const newValues = {};
    props.elements.forEach(element => {
      newValues[element.name] = element.defaultValue ?? values?.[element.name] ?? '';
    });
    setValues(newValues);
  }, [props.elements]);

  const handleDecline = () => {
    setBtnsDisabled(true);
    if (props.onDecline) {
      props.onDecline();
      return;
    }
    hideFormModal();
  };

  const handleAccept = async () => {
    setBtnsDisabled(true);
    const newErrors = {};
    for (const element of props.elements) {
      if ((element.required ?? true) && (!values[element.name] || values[element.name].trim() === '')) {
        newErrors[element.name] = true;
      }
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      await props.onAccept(values);
    }
    setBtnsDisabled(false);
  };

  const handleChange = (name: string, value: string) => {
    const _values = { ...values };
    _values[name] = value;
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
    setValues(_values);
  };

  return (
    <div className={classes.root}>
      {props.header?.trim() !== '' && (
        <Typography variant='h6' className={classes.header}>
          {props.header}
        </Typography>
      )}
      {props.elements.map((e, i) => (
        <div key={e.name} className={'simpleform-element'}>
          {e.render({
            name: e.name,
            autoFocus: i === 0,
            value: values[e.name] ?? '',
            onChange: (val: string) => handleChange(e.name, String(val)),
            required: e.required ?? true,
            error: errors[e.name],
          })}
        </div>
      ))}
      <div className={classes.btnWrapper}>
        <Button.Secondary
          onClick={handleDecline}
          disabled={btnsDisabled}
          sx={{
            fontSize: '.75rem',
          }}
        >
          Decline
        </Button.Secondary>
        <Button.Primary
          onClick={handleAccept}
          disabled={btnsDisabled}
          sx={{
            fontSize: '.75rem',
          }}
        >
          Accept
        </Button.Primary>
      </div>
    </div>
  );
};
