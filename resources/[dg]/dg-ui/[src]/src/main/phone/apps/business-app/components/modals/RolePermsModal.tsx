import { FC, useEffect, useMemo, useState } from 'react';
import { Input } from '@src/components/inputs';
import { SimpleForm } from '@src/components/simpleform';
import { showLoadModal } from '@src/main/phone/lib';

import { useBusinessAppStore } from '../../stores/useBusinessAppStore';

export const RolePermsModal: FC<{
  name?: boolean;
  permissions?: string[];
  onSubmit: (name: string, permissions: Record<string, boolean>) => Promise<any>;
}> = ({ onSubmit, name, permissions }) => {
  const [myPerms, permLabels, roles] = useBusinessAppStore(s => [
    s.list.find(b => b.id === s.currentBusiness)?.permissions ?? [],
    s.permissionLabels,
    s.roles,
  ]);

  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});
  const [selectedRole, setSelectedRole] = useState<string>(Object.keys(roles)[0] ?? '');

  const availablePermissions = useMemo(() => {
    const perms: Record<string, string> = {};
    // All permissions giveable to role, are join of props.permissions and myPerms
    myPerms.forEach(perm => {
      perms[perm] = permLabels[perm] ?? perm;
    });
    if (permissions) {
      permissions.forEach(perm => {
        perms[perm] = permLabels[perm] ?? perm;
      });
    }
    return perms;
  }, [myPerms, permLabels, permissions]);

  useEffect(() => {
    const newPerms: Record<string, boolean> = {};
    Object.keys(availablePermissions).forEach(perm => {
      newPerms[perm] = roles[selectedRole]?.includes(perm) ?? false;
    });
    setSelectedPermissions(newPerms);
  }, [availablePermissions, roles, selectedRole]);

  return (
    <SimpleForm
      elements={[
        name
          ? {
              name: 'name',
              render: () => (
                <Input.AutoComplete
                  name={'name'}
                  inputValue={selectedRole ?? ''}
                  onChange={setSelectedRole}
                  label={'Rol'}
                  options={Object.keys(roles).map(r => ({ label: r, value: r }))}
                />
              ),
              required: false,
            }
          : {
              name: 'name',
              render: props => <Input.TextField {...props} label={'Naam'} icon={'marker'} />,
              required: false,
            },
        ...Object.entries(availablePermissions).map(([perm, label]) => ({
          name: perm,
          render: () => (
            <Input.Checkbox
              name={perm}
              checked={selectedPermissions?.[perm] ?? permissions?.includes(perm) ?? false}
              onChange={e =>
                setSelectedPermissions({
                  ...selectedPermissions,
                  [perm]: e.target.checked,
                })
              }
              label={label}
            />
          ),
          required: false,
        })),
      ]}
      onAccept={async (vals: { name: string }) => {
        if (!selectedRole && vals?.name.trim() === '') return;
        showLoadModal();
        await onSubmit(vals?.name.trim() === '' ? selectedRole : vals.name, selectedPermissions);
      }}
    />
  );
};
