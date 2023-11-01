import { FC, useEffect, useState } from 'react';
import * as React from 'react';
import { Typography } from '@mui/material';

import { hideFormModal } from '../main/phone/lib';
import { styles } from '../styles/components/simpleform.styles';

import { Button } from './button';

const hasErrors = (errors: Record<string, boolean>) => {
  return Object.keys(errors).some(key => errors[key]);
};

export const SimpleForm: FC<React.PropsWithChildren<SimpleForm.Form>> = props => {
  const classes = styles();
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [btnsDisabled, setBtnsDisabled] = useState(false);

  useEffect(() => {
    const newValues = {};
    for (const element of props.elements) {
      newValues[element.name] = values?.[element.name] ?? element.defaultValue ?? '';
    }
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
    const newErrors = { ...errors };
    // check if all required fields are filled
    for (const element of props.elements) {
      if (
        (element.required ?? true) &&
        (values[element.name] === undefined ||
          (typeof values[element.name] === 'string' && values[element.name].trim() === ''))
      ) {
        newErrors[element.name] = true;
      }
    }
    setErrors(newErrors);
    if (!hasErrors(newErrors)) {
      await props.onAccept(values);
    }
    setBtnsDisabled(false);
  };

  const handleChange = (name: string, value: any) => {
    const _values = { ...values };
    _values[name] = value;
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
    setValues(_values);
  };

  const buttonDisabled = btnsDisabled || hasErrors(errors);

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
            onChange: (val: string) => handleChange(e.name, val),
            required: e.required ?? true,
            error: !!errors[e.name],
            setError: (hasError: boolean) => {
              setErrors({ ...errors, [e.name]: hasError });
            },
          })}
        </div>
      ))}
      <div className={classes.btnWrapper}>
        <Button.Secondary
          onClick={handleDecline}
          disabled={buttonDisabled}
          sx={{
            fontSize: '.75rem',
          }}
        >
          Decline
        </Button.Secondary>
        <Button.Primary
          onClick={handleAccept}
          disabled={buttonDisabled}
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
