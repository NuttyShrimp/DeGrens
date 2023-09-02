import { Input } from '../../../../../components/inputs';
import { SimpleForm } from '../../../../../components/simpleform';
import { nuiAction } from '../../../../../lib/nui-comms';
import { showCheckmarkModal, showLoadModal, showWarningModal } from '../../../lib';
import { usePayconiqAppStore } from '../stores/usePayconiqAppStore';

export const TransactionModal = () => {
  const setDirty = usePayconiqAppStore(s => s.setDirty);
  return (
    <SimpleForm
      elements={[
        {
          name: 'target',
          render: props => <Input.Contact {...props} />,
        },
        {
          name: 'amount',
          render: props => <Input.Number {...props} label={'Amount'} icon={'euro-sign'} />,
        },
        {
          name: 'comment',
          render: props => <Input.TextField {...props} label={'Opmerking'} icon={'comment'} />,
        },
      ]}
      onAccept={async vals => {
        showLoadModal();
        const success = await nuiAction<boolean>('phone/payconiq/makeTransaction', vals);
        (success ? showCheckmarkModal : showWarningModal)(() => {
          setDirty(true);
        });
      }}
    />
  );
};
