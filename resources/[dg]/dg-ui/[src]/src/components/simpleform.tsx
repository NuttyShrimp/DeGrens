import React, { FC, useEffect, useState } from 'react';
import { Typography } from '@mui/material';

import { hideFormModal } from '../main/phone/lib';
import { styles } from '../styles/components/simpleform.styles';

import { Button } from './button';

export const SimpleForm: FC<React.PropsWithChildren<SimpleForm.Form>> = props => {
  const classes = styles();
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const newValues = {};
    props.elements.forEach(element => {
      newValues[element.name] = element.defaultValue ?? values?.[element.name] ?? '';
    });
    setValues(newValues);
  }, [props.elements]);

  const handleDecline = () => {
    if (props.onDecline) {
      props.onDecline();
    }
    hideFormModal();
  };

  const handleAccept = () => {
    const newErrors = {};
    for (const element of props.elements) {
      if ((element.required ?? true) && (!values[element.name] || values[element.name].trim() === '')) {
        newErrors[element.name] = true;
      }
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      props.onAccept(values);
    }
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
      {props.elements.map(e => (
        <div key={e.name} className={'simpleform-element'}>
          {e.render({
            name: e.name,
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
          sx={{
            fontSize: '.75rem',
          }}
        >
          Decline
        </Button.Secondary>
        <Button.Primary
          onClick={handleAccept}
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
