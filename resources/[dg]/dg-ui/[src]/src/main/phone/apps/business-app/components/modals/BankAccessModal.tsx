import { FC, useState } from 'react';
import { Input } from '@src/components/inputs';
import { SimpleForm } from '@src/components/simpleform';
import { showLoadModal } from '@src/main/phone/lib';

const PERMISSIONS: Record<keyof Financials.AccountPermission, string> = {
  deposit: 'Deposit',
  withdraw: 'Withdraw',
  transfer: 'Transfer',
  transactions: 'View transactions',
};

export const BankAccessModal: FC<{
  permissions?: Financials.AccountPermission;
  onSubmit: (permissions: Financials.AccountPermission) => Promise<any>;
}> = ({ onSubmit, permissions }) => {
  const [selPermissions, setSelPermissions] = useState<Financials.AccountPermission>(
    permissions ?? {
      deposit: false,
      withdraw: false,
      transfer: false,
      transactions: false,
    }
  );
  return (
    <SimpleForm
      elements={Object.keys(PERMISSIONS).map(p => ({
        name: p,
        render: () => (
          <Input.Checkbox
            name={p}
            checked={selPermissions[p]}
            onChange={e =>
              setSelPermissions({
                ...selPermissions,
                [p]: e.target.checked,
              })
            }
            label={PERMISSIONS[p]}
          />
        ),
        required: false,
      }))}
      onAccept={async () => {
        showLoadModal();
        await onSubmit(selPermissions);
      }}
    />
  );
};
