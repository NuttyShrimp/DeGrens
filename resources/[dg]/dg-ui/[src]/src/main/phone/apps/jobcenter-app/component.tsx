import React from 'react';
import { compose, connect } from '@lib/redux';
import { devData } from '@src/lib/devdata';
import { isDevel } from '@src/lib/env';

import { nuiAction } from '../../../../lib/nui-comms';

import { JobCenter } from './components/jobcenter';
import store from './store';

import './styles/jobcenter.scss';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<Phone.JobCenter.Props, any> {
  async fetchJobs() {
    this.props.updateState({
      jobs: await nuiAction('phone/jobs/get', {}, devData.jobs),
    });
  }

  componentDidMount() {
    this.fetchJobs();
    if (!isDevel()) return;
    this.props.updateState({
      currentGroup: devData.currentGroup,
      groupMembers: devData.groupMembers,
      isOwner: true,
    });
  }

  render() {
    return <JobCenter {...this.props} />;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
