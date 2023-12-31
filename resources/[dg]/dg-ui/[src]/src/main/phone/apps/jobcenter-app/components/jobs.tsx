import { FC } from 'react';
import * as React from 'react';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import { Paper } from '../../../../../components/paper';
import { nuiAction } from '../../../../../lib/nui-comms';
import { useJobcenterAppStore } from '../stores/useJobcenterAppStore';

const DollarLevel: FC<React.PropsWithChildren<{ level: number }>> = props => {
  return (
    <div className={'jobcenter__jobList__level'}>
      {Array(props.level)
        .fill(0)
        .map((_, i) => (
          <AttachMoneyIcon key={i} color={'success'} />
        ))}
      {Array(6 - props.level)
        .fill(0)
        .map((_, i) => (
          <AttachMoneyIcon key={i} />
        ))}
    </div>
  );
};

export const Jobs = () => {
  const jobs = useJobcenterAppStore(s => s.jobs);
  return (
    <div className={'jobcenter__jobList'}>
      {(jobs ?? []).map(j => (
        <Paper
          key={j.title}
          title={
            <p>
              {!j.legal && (
                <span className={'jobcenter__jobList__title__icon'}>
                  <i className={'fas fa-user-secret'} />
                </span>
              )}
              {j.title}
            </p>
          }
          description={j.level ? <DollarLevel level={j.level} /> : null}
          image={j.icon}
          actions={
            j.legal
              ? [
                  {
                    title: 'Zet locatie',
                    icon: 'map-marked',
                    onClick: () => {
                      nuiAction('phone/jobs/waypoint', {
                        job: j.name,
                      });
                    },
                  },
                ]
              : []
          }
        />
      ))}
    </div>
  );
};
