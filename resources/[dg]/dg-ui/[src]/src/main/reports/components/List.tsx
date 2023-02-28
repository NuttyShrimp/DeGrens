import React, { useEffect } from 'react';
import { Typography } from '@mui/material';
import { Icon } from '@src/components/icon';
import { formatRelativeTime } from '@src/lib/util';

import { useReportStore } from '../stores/reportStore';
export const ReportList = () => {
  const [reports, unreadIds, selectReport, setTitleInfo, markRead] = useReportStore(s => [
    s.reports,
    s.unread,
    s.selectReport,
    s.setTitleInfo,
    s.markRead,
  ]);

  const joinReport = (id: number) => {
    selectReport(id);
    markRead(id);
  };

  useEffect(() => {
    setTitleInfo({
      title: 'Reports',
      back: false,
      add: true,
      close: false,
    });
  }, []);

  return (
    <div>
      {reports.length === 0 && (
        <div className='center'>
          <Typography variant='subtitle1'>Geen reports gevonden</Typography>
        </div>
      )}
      <div className='reports-list'>
        {reports.map(r => (
          <div
            className={`reports-list-entry ${unreadIds.includes(r.id) ? 'unread' : ''}`}
            key={r.id}
            onClick={() => joinReport(r.id)}
          >
            <Typography variant='h6'>{r.title}</Typography>
            <div className='reports-list-entry-info'>
              <div>
                <Icon name='clock' size='1rem' /> {formatRelativeTime(r.updatedAt)}
              </div>
              <div>
                <Icon name='user' size='1rem' /> {r.members?.length}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};