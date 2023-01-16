import React, { FC, useEffect } from 'react';
import { devData } from '@src/lib/devdata';
import { isDevel } from '@src/lib/env';

import { nuiAction } from '../../../../lib/nui-comms';

import { JobCenter } from './components/jobcenter';
import { useJobcenterAppStore } from './stores/useJobcenterAppStore';

import './styles/jobcenter.scss';

const Component: FC<{}> = () => {
  const [setJobs, setGroup] = useJobcenterAppStore(s => [s.setJobs, s.setGroup]);
  const fetchJobs = async () => {
    setJobs(await nuiAction('phone/jobs/get', {}, devData.jobs));
  };

  useEffect(() => {
    fetchJobs();
    if (!isDevel()) return;
    setGroup(devData.currentGroup, devData.groupMembers, true);
  }, []);

  return <JobCenter />;
};

export default Component;
