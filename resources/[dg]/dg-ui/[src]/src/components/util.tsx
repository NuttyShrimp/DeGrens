// Components to make life easier with TS
import React, { FC } from 'react';
import BounceLoader from 'react-spinners/BounceLoader';

import { SimpleForm } from './simpleform';

export const EmptyDiv = () => <div />;

export const ConfirmationModal: FC<{
  onAccept: (data: any) => void;
  header?: string;
}> = props => (
  <SimpleForm
    header={props.header ?? 'Weet je zeker dat je deze actie wilt doen'}
    elements={[]}
    onAccept={props.onAccept}
  />
);

export const Loader: FC = () => <BounceLoader size={60} color={'white'} />;
