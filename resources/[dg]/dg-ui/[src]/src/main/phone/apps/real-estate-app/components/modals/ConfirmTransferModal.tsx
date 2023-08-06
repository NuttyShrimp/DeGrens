import { Typography } from '@mui/material';
import { SimpleForm } from '@src/components/simpleform';
import { nuiAction } from '@src/lib/nui-comms';
import { showCheckmarkModal, showFormModal, showLoadModal, showWarningModal } from '@src/main/phone/lib';

import { useRealEstateStore } from '../../stores/useRealEstateStore';

import { AccessListModal } from './KeyListModal';

export const ConfirmTransferModal = ({
  property,
  target,
}: {
  property: Phone.RealEstate.OwnedProperty;
  target: Phone.RealEstate.AccessEntry;
}) => {
  const [fetchProperties] = useRealEstateStore(s => [s.fetchProperties]);
  return (
    <SimpleForm
      header='Confirm transfer'
      elements={[
        {
          name: 'text',
          render: () => (
            <Typography variant='body2'>
              Are you sure you want to transfer {property.name} to {target.name}({target.cid})<br />
              This will remove all the current house keys
            </Typography>
          ),
          required: false,
        },
      ]}
      onDecline={() => {
        showFormModal(<AccessListModal property={property} />);
      }}
      onAccept={async () => {
        showLoadModal();
        const success = await nuiAction(
          'phone/realestate/transferOwnership',
          { name: property.name, cid: target.cid },
          true
        );
        success
          ? showCheckmarkModal(() => {
              fetchProperties();
            })
          : showWarningModal();
      }}
    />
  );
};
