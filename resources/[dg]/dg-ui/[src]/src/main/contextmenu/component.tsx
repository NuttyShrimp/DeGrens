import React from 'react';
import AppWrapper from '@components/appwrapper';
import { compose, connect } from '@lib/redux';

import { uuidv4 } from '../../lib/util';

import { ContextMenu } from './components/contextmenu';
import store from './store';

import './styles/contextmenu.scss';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<ContextMenu.Props, any> {
  constructor(props) {
    super(props);
    this.state = {
      id: 0,
    };
  }

  generateIds = (entries: ContextMenu.Entry[]): ContextMenu.Entry[] => {
    const ids: string[] = [];
    const getId = (): string => {
      let id = uuidv4();
      while (ids.indexOf(id) !== -1) {
        id = uuidv4();
      }
      return id;
    };
    entries.forEach(entry => {
      if (!entry.id) return;
      ids.push(entry.id);
    });
    return entries.map(entry => {
      entry.id = entry.id ?? getId();
      if (entry.submenu) {
        entry.submenu = this.generateIds(entry.submenu);
      }
      return entry;
    });
  };

  onShow = (data: ContextMenu.Entry[]) => {
    data = this.generateIds(data);
    this.props.updateState({
      visible: true,
      entries: data,
      allEntries: data,
      parentEntry: [],
    });
  };

  onHide = () => {
    this.props.updateState({
      visible: false,
      entries: [],
      allEntries: [],
      parentEntry: [],
    });
    return true;
  };

  render() {
    return (
      <AppWrapper appName={store.key} onShow={this.onShow} onHide={this.onHide} onEscape={this.onHide} full>
        <ContextMenu {...this.props} />
      </AppWrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
