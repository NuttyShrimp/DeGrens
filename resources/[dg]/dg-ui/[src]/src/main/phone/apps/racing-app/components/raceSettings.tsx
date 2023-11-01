import { useState } from 'react';
import { Button } from '@src/components/button';
import { Input } from '@src/components/inputs';
import { nuiAction } from '@src/lib/nui-comms';

import { useRacingAppStore } from '../stores/racingAppStore';

export const RaceSettings = () => {
  const [alias, setAlias] = useRacingAppStore(s => [s.racingAlias, s.setRacingAlias]);
  const [newAlias, setNewAlias] = useState(alias);

  const fetchSettings = async () => {
    if (newAlias === '') return;
    await nuiAction('phone/racing/settings', { alias: newAlias });
    setAlias(newAlias);
  };

  return (
    <div>
      <Input.TextField label={'Racing Alias'} value={newAlias} onChange={setNewAlias} />

      <div className='center' style={{ marginTop: '1vh' }}>
        <Button.Primary onClick={fetchSettings}>Save</Button.Primary>
      </div>
    </div>
  );
};
