import { useMemo, useState } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Input } from '@src/components/inputs';
import { SimpleForm } from '@src/components/simpleform';
import { nuiAction } from '@src/lib/nui-comms';
import { showCheckmarkModal } from '@src/main/phone/lib';
import dayjs from 'dayjs';

export const RaceCreationModal = ({ trackId, multiLap }: { trackId: number; multiLap: boolean }) => {
  const [forLeaderboard, setForLeaderboard] = useState(false);

  const elements = useMemo(() => {
    const elements: SimpleForm.FormElement[] = [
      {
        name: 'startTime',
        defaultValue: dayjs().add(30, 'minutes'),
        render: props => <DateTimePicker {...props} disablePast ampm={false} />,
      },
      {
        name: 'leaderboard',
        defaultValue: false,
        render: props => (
          <Input.Checkbox
            {...props}
            label='For the leaderboard'
            checked={forLeaderboard}
            onChange={e => {
              props.onChange(e.target.checked);
              setForLeaderboard(e.target.checked);
            }}
          />
        ),
      },
      {
        name: 'classRestriction',
        required: false,
        defaultValue: 'A',
        render: props => (
          <Input.AutoComplete
            {...props}
            disabled={!forLeaderboard}
            label='Voertuig klasse restrictie'
            options={['X', 'S', 'A+', 'A', 'B', 'C', 'D'].map(c => ({ label: c, value: c }))}
          />
        ),
      },
    ];
    if (multiLap) {
      elements.unshift({
        name: 'laps',
        defaultValue: 1,
        render: props => <Input.Number min={1} {...props} label='Aantal rondes' />,
      });
    }
    return elements;
  }, [forLeaderboard, multiLap]);
  return (
    <SimpleForm
      elements={elements}
      header='Create race'
      onAccept={async data => {
        data.trackId = trackId;
        // data.startTime = data.startTime.toDate().toString();
        await nuiAction('phone/racing/start', data);
        showCheckmarkModal();
      }}
    />
  );
};
