import { Input } from '@src/components/inputs';
import { SimpleForm } from '@src/components/simpleform';
import { nuiAction } from '@src/lib/nui-comms';
import { showCheckmarkModal } from '@src/main/phone/lib';

export const TrackCreationModal = () => {
  return (
    <SimpleForm
      header='Create race track'
      elements={[
        {
          name: 'name',
          render: props => <Input.TextField {...props} label={'Name'} icon={'input-text'} />,
        },
        {
          name: 'type',
          render: props => (
            <Input.AutoComplete
              {...props}
              options={[
                { value: 'sprint', label: 'Sprint' },
                { value: 'lap', label: 'Lapped' },
              ]}
              label={'Type'}
              icon={'flag'}
            />
          ),
        },
      ]}
      onAccept={async data => {
        data.type = data.type.toLowerCase();
        await nuiAction('phone/racing/track/create', data);
        showCheckmarkModal();
      }}
    />
  );
};
