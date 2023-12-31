import { Input } from '../../../../../components/inputs';
import { SimpleForm } from '../../../../../components/simpleform';
import { hideFormModal } from '../../../lib';
import { openConversation } from '../lib';

export const NewConversationModal = () => (
  <SimpleForm
    header='Nieuw gesprek'
    elements={[
      {
        name: 'number',
        render: props => <Input.Contact {...props} />,
      },
    ]}
    onAccept={({ number }) => {
      hideFormModal();
      openConversation(number);
    }}
  />
);
