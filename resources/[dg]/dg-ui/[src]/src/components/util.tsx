// Components to make life easier with TS
import { FC } from 'react';
import * as React from 'react';
import BounceLoader from 'react-spinners/BounceLoader';

import { SimpleForm } from './simpleform';

export const ConfirmationModal: FC<
  React.PropsWithChildren<{
    onAccept: (data: any) => void;
    header?: string;
  }>
> = props => (
  <SimpleForm
    header={props.header ?? 'Weet je zeker dat je deze actie wilt doen'}
    elements={[]}
    onAccept={props.onAccept}
  />
);

export const Loader: FC<React.PropsWithChildren<unknown>> = () => (
  <div className='centered-container'>
    <BounceLoader size={60} color={'white'} />
  </div>
);
