import { ChangeEvent, FC, FocusEvent, forwardRef, KeyboardEvent, SyntheticEvent, useState } from 'react';
import * as React from 'react';
import Autocomplete, { AutocompleteProps as AutocompletePropsMUI } from '@mui/material/Autocomplete';
import Checkbox, { CheckboxProps } from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import TextField, { TextFieldProps as TextFieldPropsMUI } from '@mui/material/TextField';
import { makeStyles } from '@mui/styles';
import { Box } from '@mui/system';
import { emptyFn, uuidv4 } from '@src/lib/util';
import { useContactAppStore } from '@src/main/phone/apps/contacts-app/stores/useContactAppStore';

import { nuiAction } from '../lib/nui-comms';

import NumberFormat from './numberformat';

// region Types
declare type changeFunction = (value: string, name: string, evt: SyntheticEvent) => void;
declare type TextFieldProps = Partial<Omit<TextFieldPropsMUI, 'onChange'>> & {
  /**
   * Fontawesome icon name with the prefix `fas fa-`
   */
  icon?: string | JSX.Element;
  iconLib?: 'fas' | 'far' | 'fal' | 'fab';
  onChange: changeFunction;
  handleEnter?: changeFunction;
};
declare type NumberInputProps = TextFieldProps & {
  min?: number;
  max?: number;
};

declare type AutoCompleteProps = Partial<Omit<AutocompletePropsMUI<any, any, any, any>, 'onChange'>> & {
  options: {
    label: string;
    value: string;
  }[];
  label: string;
  name: string;
  onChange: changeFunction;
  freeSolo?: boolean;
  icon?: string;
  iconLib?: 'fas' | 'far' | 'fal' | 'fab';
  error?: boolean;
};

declare interface ICheckboxProps extends CheckboxProps {
  label: string;
  checked: boolean;
  name: string;
  onChange: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}

declare type MoneyAmountProps = TextFieldProps & {
  prefix?: string;
  min?: number;
  max?: number;
};

declare interface OSInput {
  TextField: FC<React.PropsWithChildren<TextFieldProps>>;
  Password: FC<React.PropsWithChildren<TextFieldProps>>;
  Number: FC<React.PropsWithChildren<NumberInputProps>>;
  AutoComplete: FC<React.PropsWithChildren<AutoCompleteProps>>;
  Checkbox: FC<React.PropsWithChildren<ICheckboxProps>>;
  MoneyAmount: FC<React.PropsWithChildren<MoneyAmountProps>>;
  PhoneNumber: FC<React.PropsWithChildren<TextFieldProps>>;
  Search: FC<React.PropsWithChildren<TextFieldProps>>;
  Contact: FC<
    React.PropsWithChildren<
      Omit<AutoCompleteProps, 'freeSolo' | 'options' | 'label'> & {
        label?: string;
        setError?: (hasError: boolean) => void;
      }
    >
  >;
}

// endregion
// region Styles
// TODO: Move to seperate file
const inputNumberStyles = makeStyles({
  input: {
    '& input::-webkit-outer-spin-button, input::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
  },
});
// endregion
const EmptyDiv = () => <div />;
export const Input: OSInput = {
  TextField: EmptyDiv,
  Password: EmptyDiv,
  Number: EmptyDiv,
  AutoComplete: EmptyDiv,
  Checkbox: EmptyDiv,
  MoneyAmount: EmptyDiv,
  PhoneNumber: EmptyDiv,
  Search: EmptyDiv,
  Contact: EmptyDiv,
};

const StyledInput = styled(TextField)({
  '&': {
    pointerEvents: 'none',
  },
  '& > div': {
    pointerEvents: 'auto',
  },
});

Input.TextField = props => {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (props.onChange) {
      props.onChange(e.target.value, e.target.name, e);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (props.handleEnter) {
          props.handleEnter((e.target as any).value, (e.target as any).name, e);
        }
        break;
      default:
        break;
    }
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    nuiAction('controls/setFocus', {
      state: true,
    });
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    nuiAction('controls/setFocus', {
      state: false,
    });
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  return (
    <StyledInput
      variant='standard'
      {...props}
      fullWidth={props.fullWidth ?? true}
      onChange={onChange}
      onKeyPress={handleKeyPress}
      InputProps={{
        ...props.InputProps,
        type: props.type ?? 'normal',
        startAdornment:
          (props.icon && (
            <InputAdornment position='start'>
              {typeof props.icon == 'string' ? (
                <i className={`${props.iconLib ?? 'fas'} fa-${props.icon}`} />
              ) : (
                props.icon
              )}
            </InputAdornment>
          )) ||
          undefined,
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
};

Input.Password = props => {
  return <Input.TextField {...props} type='password' />;
};

Input.Number = props => {
  const styles = inputNumberStyles();
  return (
    <Input.TextField
      {...props}
      className={`${styles.input} ${props.className ?? ''}`}
      inputProps={{
        inputMode: 'numeric',
        pattern: '[0-9]*',
      }}
      type={'number'}
      InputProps={{
        ...props.InputProps,
        inputProps: {
          min: props.min,
          max: props.max,
        },
        type: 'number',
      }}
    />
  );
};

Input.AutoComplete = ({ options, freeSolo, inputValue, ...props }) => {
  return (
    <Autocomplete
      options={options.map(option => option.label)}
      onInputChange={(e, inputval) => {
        if (freeSolo) {
          props.onChange(inputval, props.name, e);
          return;
        }
        const inputValue = options.find(option => option.label === inputval)?.value;
        props.onChange(inputValue, props.name, e);
      }}
      freeSolo={freeSolo ?? false}
      fullWidth
      inputValue={inputValue}
      // IDK where this color prop is situated so atm can't remove it to fix it
      // @ts-ignore
      renderInput={params => <Input.TextField {...params} {...props} type='text' />}
    />
  );
};

Input.Checkbox = props => (
  <FormControlLabel control={<Checkbox {...props} color={props.color ?? 'primary'} />} label={props.label} />
);

const NumberFormatCustom = forwardRef(function NumberFormatCustom(props: any, ref: any) {
  const { prefix, formatType, ...other } = props;
  const Comp = NumberFormat[formatType];
  return <Comp {...other} getInputRef={ref} displayType={'input'} prefix={prefix ?? ''} />;
});

Input.MoneyAmount = props => {
  return (
    <Input.TextField
      {...props}
      type='text'
      InputProps={{
        inputComponent: NumberFormatCustom as any,
        inputProps: {
          prefix: props.prefix,
          min: props.min,
          max: props.max,
          value: String(props.value),
          formatType: 'Bank',
        },
      }}
    />
  );
};

Input.PhoneNumber = props => {
  return (
    <Input.TextField
      {...props}
      type='text'
      InputProps={{
        inputComponent: NumberFormatCustom as any,
        inputProps: {
          value: String(props.value),
          name: props.name,
          formatType: 'Phone',
        },
      }}
    />
  );
};

Input.Search = props => {
  return <Input.TextField {...props} label={'Search'} icon={'search'} />;
};

Input.Contact = props => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const contacts = useContactAppStore(s => s.contacts);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [value, setValue] = useState<string>('');

  const onChangeCapture = value => {
    setValue(value);
    const isNumber = !isNaN(+value);
    props.setError?.(!isNumber);
    if (isNumber) {
      //@ts-ignore - onChange func of simplemodalform only requires val instead
      props.onChange(value);
    }
  };

  return (
    // we dont use Input.AutoComplete because we need to use some custom renderoptions etc
    <Autocomplete
      {...props}
      options={contacts.map(c => ({ label: c.label, value: c.phone }))}
      freeSolo
      fullWidth
      inputValue={value}
      // custom renderoption to fix the key issues
      renderOption={(props, option) => (
        <Box component='li' {...props} key={uuidv4()}>
          {option.label}
        </Box>
      )}
      filterOptions={(options, state) =>
        options.filter(
          o =>
            o.label.toLowerCase().includes(state.inputValue.toLowerCase()) ||
            o.value.toLowerCase().includes(state.inputValue.toLowerCase())
        )
      }
      // this makes forces input value to chance to value when typing in label
      getOptionLabel={option => (typeof option === 'string' ? option : option.value)}
      onInputChange={(_, value) => onChangeCapture(value)}
      onChange={emptyFn} // throws ts warning otherwise
      renderInput={params => (
        <Input.TextField
          {...params}
          icon={props.icon ?? 'mobile'}
          label={props.label ?? 'TelefoonNr'}
          error={props.error}
          helperText={props.error ? 'Niet geldig' : ''}
          type='text'
          inputProps={{ ...params.inputProps, autoComplete: 'new-password' }}
          onChange={emptyFn} // throws ts warning otherwise
        />
      )}
    />
  );
};
