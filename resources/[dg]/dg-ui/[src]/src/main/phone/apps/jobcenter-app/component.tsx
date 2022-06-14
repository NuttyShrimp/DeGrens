import React, { useEffect } from 'react';
import { devData } from '@src/lib/devdata';
import { isDevel } from '@src/lib/env';

import { nuiAction } from '../../../../lib/nui-comms';

import { JobCenter } from './components/jobcenter';

import './styles/jobcenter.scss';

const Component: AppFunction<Phone.JobCenter.State> = props => {
  const fetchJobs = async () => {
    props.updateState({
      jobs: await nuiAction('phone/jobs/get', {}, devData.jobs),
    });
  };

  useEffect(() => {
    fetchJobs();
    if (!isDevel()) return;
    props.updateState({
      currentGroup: devData.currentGroup,
      groupMembers: devData.groupMembers,
      isOwner: true,
    });
  }, []);

  return <JobCenter {...props} />;
};

export default Component;
