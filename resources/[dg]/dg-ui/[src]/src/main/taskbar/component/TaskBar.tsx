import { FillableIcon } from '@src/components/icon';

import { useTaskbarStore } from '../stores/useTaskbarStore';

export const TaskBar = () => {
  const [icon, duration, label] = useTaskbarStore(s => [s.icon, s.duration, s.label]);
  return (
    <div className={'taskbar__wrapper'}>
      <div>
        <div className='taskbar__icon'>
          <FillableIcon height={7} name={icon} duration={duration} value={100} />
        </div>
        <div>
          <div className={'taskbar__label'}>{label}</div>
        </div>
      </div>
    </div>
  );
};
