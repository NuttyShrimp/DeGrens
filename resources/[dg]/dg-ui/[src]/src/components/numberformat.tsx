import { FC } from 'react';
import * as React from 'react';
import { NumericFormat, NumericFormatProps, PatternFormat, PatternFormatProps } from 'react-number-format';

import { EmptyDiv } from './emptyDiv';

export const NumberFormat: {
  Phone: FC<React.PropsWithChildren<PatternProps>>;
  Bank: FC<React.PropsWithChildren<NumberFormatProps>>;
} = {
  Phone: EmptyDiv,
  Bank: EmptyDiv,
};
export default NumberFormat as Required<typeof NumberFormat>;

type onChangeCapture = (e: { target: { name: string; value: string } }) => void;

type NumberFormatProps = NumericFormatProps & {
  name?: string;
  value: string | number;
  onChange?: onChangeCapture;
};

type PatternProps = PatternFormatProps & {
  name?: string;
  value: string | number;
  onChange?: onChangeCapture;
};

NumberFormat.Phone = ({ onChange, ...props }: PatternProps) => {
  return (
    <PatternFormat
      displayType={props.displayType ?? 'text'}
      valueIsNumericString
      {...props}
      format={'#### ## ## ##'}
      onValueChange={values => {
        if (!onChange) return;
        if (!props.name) throw new Error('NumberFormat missing name');
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
    />
  );
};

NumberFormat.Bank = ({ onChange, ...props }: NumberFormatProps) => {
  return (
    <NumericFormat
      displayType={props.displayType ?? 'text'}
      thousandsGroupStyle='thousand'
      thousandSeparator='.'
      decimalSeparator=','
      allowNegative
      fixedDecimalScale
      decimalScale={2}
      valueIsNumericString
      {...props}
      onValueChange={values => {
        if (!onChange) return;
        if (!props.name) throw new Error('NumberFormat missing name');
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
    />
  );
};
