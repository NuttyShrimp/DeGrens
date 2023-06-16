import { FC, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

import { Button } from '../../../../../components/button';
import { Paper } from '../../../../../components/paper';
import { nuiAction } from '../../../../../lib/nui-comms';
import { AppContainer } from '../../../os/appcontainer/appcontainer';
import { useBusinessAppStore } from '../stores/useBusinessAppStore';

const ACTION_ICONS = {
  hire: 'user-plus',
  fire: 'user-slash',
  role: 'tag',
  bankPerms: 'building-columns',
};

const ACTION_TITLE = {
  hire: 'Aangenomen',
  fire: 'Ontslagen',
  role: 'Rol wijzeging',
  bankPerms: 'Bank Toegang',
};

export const LogList: FC<{}> = () => {
  const [logs, currentBusiness, updateStore] = useBusinessAppStore(s => [s.logs, s.currentBusiness, s.updateStore]);
  const [filteredLogs, setFilteredLogs] = useState(logs);
  const [fetchingLogs, setFetchingLogs] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setFilteredLogs(logs);
  }, [logs]);

  const fetchExtraLogs = async () => {
    flushSync(() => setFetchingLogs(true));
    const extraLogs = await nuiAction<Phone.Business.Log[]>('phone/business/getLogs', {
      offset: offset + 1,
      id: currentBusiness,
    });
    if (!extraLogs) {
      flushSync(() => setFetchingLogs(false));
      return;
    }
    setOffset(offset + 1);
    updateStore({
      logs: logs.concat(extraLogs),
    });
    flushSync(() => setFetchingLogs(false));
  };

  return (
    <AppContainer
      emptyList={logs.length === 0}
      search={{
        list: logs,
        filter: ['name', 'type', 'action'],
        onChange: setFilteredLogs,
      }}
      onClickBack={() => {
        updateStore({
          currentBusiness: null,
          activeApp: 'employee',
          employees: [],
          roles: {},
        });
      }}
    >
      <div>
        {filteredLogs.map(log => (
          <Paper
            key={log.id}
            title={ACTION_TITLE[log.type]}
            description={<p>{`${log.name} heeft ${log.action}`}</p>}
            image={ACTION_ICONS[log.type] ?? 'bug'}
            allowLongDescription
          />
        ))}
        <Button.Primary disabled={fetchingLogs} onClick={fetchExtraLogs}>
          Laad meer
        </Button.Primary>
      </div>
    </AppContainer>
  );
};
