import React from 'react';
import { compose, connect } from '@lib/redux';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';

import { Notes } from './components/notes';
import store from './store';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<Phone.Notes.Props, any> {
  async fetchNotes() {
    const _notes = await nuiAction<Phone.Notes.Note[]>('phone/notes/get', {}, devData.notes);
    const sortedNotes = _notes.sort((n1, n2) => n1.date - n2.date);
    this.props.updateState({
      list: sortedNotes,
    });
  }

  componentDidMount() {
    this.fetchNotes();
  }

  render() {
    return <Notes {...this.props} />;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
