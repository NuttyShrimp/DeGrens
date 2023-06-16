import { Input } from '../../../../../components/inputs';
import { SimpleForm } from '../../../../../components/simpleform';
import { nuiAction } from '../../../../../lib/nui-comms';
import { showCheckmarkModal, showLoadModal } from '../../../lib';
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
      onAccept={vals => {
        showLoadModal();
        nuiAction('phone/payconiq/makeTransaction', vals);
        showCheckmarkModal(() => {
          setDirty(true);
        });
      }}
    />
  );
};
