import { Stack } from '@mui/material';
import { Button } from '@src/components/button';
import { nuiAction } from '@src/lib/nui-comms';
import { hideFormModal } from '@src/main/phone/lib';

const LOCATIONS = ['clothing', 'stash', 'logout'];

export const SetLocationModal = ({ property }: { property: Phone.RealEstate.Property }) => {
  return (
    <Stack gap={2} alignItems={'center'} pt={'1.5rem'}>
      {LOCATIONS.map(l => (
        <div key={l}>
          <Button.Primary
            onClick={async () => {
              nuiAction('phone/realestate/setLocation', { name: property.name, location: l });
            }}
          >
            Set {l} location
          </Button.Primary>
        </div>
      ))}
      <div>
        <Button.Secondary onClick={() => hideFormModal()}>Close</Button.Secondary>
      </div>
    </Stack>
  );
};
