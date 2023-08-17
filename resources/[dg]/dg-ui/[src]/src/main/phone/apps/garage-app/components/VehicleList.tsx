import { FC } from 'react';
import MuiButton from '@mui/material/Button';
import { baseStyle } from '@src/base.styles';

import { Button } from '../../../../../components/button';
import { List } from '../../../../../components/list';
import { Paper } from '../../../../../components/paper';
import { nuiAction } from '../../../../../lib/nui-comms';
import { showFormModal } from '../../../lib';
import { useGarageAppStore } from '../stores/useGarageAppStore';

import { SellModal } from './SellModal';

const STATE_LABELS = {
  parked: 'Geparkeerd',
  out: 'Buiten',
  impounded: 'In beslaggenomen',
};

export const VehicleList: FC<{ fetchVehicles: () => void }> = ({ fetchVehicles }) => {
  const vehicles = useGarageAppStore(s => s.list);

  const trackVehicle = (vin: string) => {
    nuiAction('phone/garage/track', { vin });
  };

  const recoverVehicle = (veh: Phone.Garage.Vehicle) => {
    nuiAction('phone/garage/recover', { vin: veh.vin });
  };

  const sellVehicle = (veh: Phone.Garage.Vehicle) => {
    if (veh.vinscratched) return;
    showFormModal(<SellModal vin={veh.vin} name={veh.name} fetchVehicles={fetchVehicles} />);
  };

  return (
    <div>
      {vehicles.map(v => (
        <Paper
          key={v.plate}
          title={`${v.brand} ${v.name}`}
          image={'car'}
          description={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p>{v.plate.toUpperCase()}</p>
              <p>{STATE_LABELS[v.state]}</p>
            </div>
          }
          extDescription={
            <>
              <List
                items={[
                  {
                    icon: 'barcode',
                    label: v.vin,
                  },
                  {
                    icon: 'closed-captioning',
                    label: v.plate.toUpperCase(),
                  },
                  {
                    icon: 'garage-car',
                    label: STATE_LABELS[v.state],
                  },
                  {
                    icon: 'square-parking',
                    label: v.parking,
                  },
                  {
                    icon: 'oil-can',
                    label: `${v.engine / 10}%`,
                  },
                  {
                    icon: 'car-side',
                    label: `${v.body / 10}%`,
                  },
                ]}
              />
              <div className={'btnWrapper'}>
                <Button.Primary size={'small'} onClick={() => trackVehicle(v.vin)}>
                  TRACK
                </Button.Primary>
                <MuiButton
                  variant={'contained'}
                  size={'small'}
                  onClick={() => recoverVehicle(v)}
                  style={{
                    backgroundColor: baseStyle.tertiary.normal,
                  }}
                >
                  RECOVER
                </MuiButton>
                {!v.vinscratched && (
                  <Button.Secondary size={'small'} onClick={() => sellVehicle(v)}>
                    SELL
                  </Button.Secondary>
                )}
              </div>
            </>
          }
        />
      ))}
    </div>
  );
};
