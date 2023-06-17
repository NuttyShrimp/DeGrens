import { Input } from '@src/components/inputs';
import { SimpleForm } from '@src/components/simpleform';
import { nuiAction } from '@src/lib/nui-comms';
import { showCheckmarkModal, showLoadModal } from '@src/main/phone/lib';

export const FineModal = () => {
  return (
    <SimpleForm
      header='Verstuur factuur'
      elements={[
        {
          name: 'citizenid',
          render: props => <Input.Number {...props} label={'CID'} min={1000} icon={'id-card'} />,
        },
        {
          name: 'amount',
          render: props => <Input.Number {...props} label={'amount'} min={1000} icon={'dollar-sign'} />,
        },
        {
          name: 'comment',
          render: p => <Input.TextField {...p} label={'Comment'} icon={'comment-alt'} />,
          required: false,
        },
      ]}
      onAccept={async (vals: { citizenid: string; amount: string; comment: string }) => {
        showLoadModal();
        await nuiAction('phone/justice/fine', vals);
        showCheckmarkModal();
      }}
    />
  );
};
