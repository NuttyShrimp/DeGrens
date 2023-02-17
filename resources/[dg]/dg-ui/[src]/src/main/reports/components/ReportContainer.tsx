import React from 'react';
import { Divider, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { IconButton } from '@src/components/button';
import { Icon } from '@src/components/icon';

import { useReportStore } from '../stores/reportStore';

import { AddReport } from './AddReport';
import { ReportList } from './List';
import { Report } from './Report';

export const ReportContainer = () => {
  const [selectedReport, titleInfo, selectReport, setTab, tab] = useReportStore(s => [
    s.selectedReport,
    s.titleInfo,
    s.selectReport,
    s.setTab,
    s.tab,
  ]);
  return (
    <div className='reports-container'>
      <div className='reports-container-header'>
        <Stack direction={'row'} spacing={0.3}>
          {titleInfo.back && (
            <IconButton.Primary
              size='small'
              onClick={() => {
                selectReport(0);
                setTab('list');
              }}
            >
              <Icon name='chevron-left' size='1rem' />
            </IconButton.Primary>
          )}
          <Typography variant='h6'>{titleInfo.title}</Typography>
        </Stack>
        <div>
          {titleInfo.add && (
            <IconButton.Primary
              size='small'
              onClick={() => {
                setTab('new');
              }}
            >
              <Icon name='plus' size='1rem' />
            </IconButton.Primary>
          )}
        </div>
      </div>
      <Divider />
      <div>
        {tab === 'list' && (selectedReport === 0 ? <ReportList /> : <Report />)}
        {tab === 'new' && <AddReport />}
      </div>
    </div>
  );
};