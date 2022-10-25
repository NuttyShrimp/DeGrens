import React, { FC } from 'react';
import ReactNumberFormat, { NumberFormatProps as ReactNumberFormatProps } from 'react-number-format';

import { EmptyDiv } from './emptyDiv';

export const NumberFormat: {
  Phone: FC<React.PropsWithChildren<NumberFormatProps>>;
  Bank: FC<React.PropsWithChildren<NumberFormatProps>>;
} = {
  Phone: EmptyDiv,
  Bank: EmptyDiv,
};
export default NumberFormat as Required<typeof NumberFormat>;

type onChangeCapture = (e: { target: { name: string; value: string } }) => void;

type NumberFormatProps = ReactNumberFormatProps & {
  name?: string;
  value: string | number;
  onChange?: onChangeCapture;
};

NumberFormat.Phone = ({ onChange, ...props }: NumberFormatProps) => {
  return (
    <ReactNumberFormat
      displayType={props.displayType ?? 'text'}
      isNumericString
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
    <ReactNumberFormat
      displayType={props.displayType ?? 'text'}
      thousandsGroupStyle='thousand'
      thousandSeparator='.'
      decimalSeparator=','
      allowNegative
      fixedDecimalScale
      decimalScale={2}
      isNumericString
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
