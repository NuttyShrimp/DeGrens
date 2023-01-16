import React, { FC, useState } from 'react';
import { Autocomplete, Box, TextField } from '@mui/material';

import { Input } from '../../../../components/inputs';
import { SimpleForm } from '../../../../components/simpleform';
import { nuiAction } from '../../../../lib/nui-comms';
import { useFinancialsStore } from '../../stores/useFinancialsStore';

const PERMISSIONS: Record<keyof Financials.AccountPermission, string> = {
  transactions: 'Transactions',
  deposit: 'Deposit',
  withdraw: 'Withdraw',
  transfer: 'Transfer',
};

const buildDefaultModalValues = (cid?: number) => {
  return {
    cid,
    ...(Object.keys(PERMISSIONS) as (keyof Financials.AccountPermission)[]).reduce(
      (acc, cur) => ({ ...acc, [cur]: false }),
      {} as Record<keyof Financials.AccountPermission, boolean>
    ),
  };
};

export const PermissionsModal: FC<React.PropsWithChildren<Financials.ModalProps>> = props => {
  const [closeModal, openLoadModal] = useFinancialsStore(s => [s.closeModal, s.openLoaderModal]);
  const [value, setValue] = useState(''); // This is input value whatever it is
  // Processed modal values (for example cid is a number else undefined compared to value)
  const [modalValues, setModalValues] = useState<Omit<Financials.PermissionsMember, 'cid' | 'name'> & { cid?: number }>(
    buildDefaultModalValues()
  );
  const [cidError, setCidError] = useState<boolean>(true);

  const setCid = (input: string) => {
    setValue(input);
    let cid: number | undefined = parseInt(input);
    if (isNaN(cid)) {
      setCidError(true);
      cid = undefined;
    } else {
      setCidError(false);
    }
    setModalValues({ ...(props.account.members?.find(m => m.cid === cid) ?? buildDefaultModalValues(cid)) });
  };

  const setPermission = (permission: keyof Financials.AccountPermission, toggled: boolean) => {
    setModalValues(values => ({ ...values, [permission]: toggled }));
  };

  const handleAccept = async () => {
    if (cidError) return;
    openLoadModal();
    await nuiAction('financials/account/updatePermissions', {
      accountId: props.account.account_id,
      ...modalValues,
    });
    await props.fetchAccounts();
    await props.fetchTransactions(undefined, true);
    closeModal();
  };

  return (
    <SimpleForm
      header='Beheer Permissies'
      elements={[
        {
          name: 'cid',
          required: false,
          render: () => {
            const options = (props.account.members ?? []).map(m => ({
              label: `${m.name}`,
              cid: String(m.cid),
            }));
            return (
              // We dont use input variants because we want custom behavior without overwriting the input variants
              <Autocomplete
                id='cid-select'
                options={options}
                onInputChange={(e, option) => setCid(option)}
                freeSolo
                fullWidth
                getOptionLabel={option => (typeof option === 'string' ? option : option.cid)}
                inputValue={value}
                renderOption={(props, option) => (
                  <Box component='li' {...props}>
                    {option.label}
                  </Box>
                )}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='CID'
                    error={cidError}
                    helperText={cidError ? 'Niet geldig' : ''}
                    type='text'
                    inputProps={{ ...params.inputProps, autoComplete: 'new-password' }}
                  />
                )}
              />
            );
          },
        },
        ...(Object.keys(PERMISSIONS) as (keyof Financials.AccountPermission)[]).map<
          SimpleForm.Form['elements'][number]
        >(permission => ({
          name: permission,
          required: false,
          render: () => {
            return (
              <Input.Checkbox
                name={permission}
                label={PERMISSIONS[permission]}
                checked={modalValues[permission]}
                onChange={e => setPermission(permission, e.currentTarget.checked)}
              />
            );
          },
        })),
      ]}
      onAccept={handleAccept}
      onDecline={closeModal}
    />
  );
};
