import React from 'react';
import { compose, connect } from '@lib/redux';

import { showFormModal } from '../../lib';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { Contacts } from './components/contacts';
import { ContactModal } from './components/modals';
import { fetchContacts } from './lib';
import store from './store';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<Phone.Contacts.Props, any> {
  constructor(props) {
    super(props);
    this.state = {
      contacts: props.contacts,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.contacts !== this.props.contacts) {
      this.setState({ contacts: this.props.contacts });
    }
  }

  componentDidMount() {
    fetchContacts();
  }

  render() {
    return (
      <AppContainer
        primaryActions={[
          {
            title: 'Nieuw',
            icon: 'plus',
            onClick: () => {
              showFormModal(<ContactModal contact={{}} type={'new'} />);
            },
          },
        ]}
        search={{
          list: this.props.contacts,
          filter: ['label', 'phone'],
          onChange: value => {
            this.setState({
              contacts: value,
            });
          },
        }}
        emptyList={this.props.contacts.length === 0}
      >
        <Contacts contacts={this.state.contacts} />
      </AppContainer>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
