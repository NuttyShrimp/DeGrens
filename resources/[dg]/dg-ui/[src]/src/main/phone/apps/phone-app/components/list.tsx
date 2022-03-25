import React from 'react';
import { useSelector } from 'react-redux';

import { Paper } from '../../../../../components/paper';
import { formatRelativeTime } from '../../../../../lib/util';
import { addNotification, showFormModal } from '../../../lib';
import { ContactModal } from '../../contacts-app/components/modals';
import { getContact } from '../../contacts-app/lib';
import { startPhoneCall } from '../lib';

import { styles } from './phone.styles';

export const PhoneList = () => {
  const calls = useSelector<RootState, Phone.Phone.Call[]>(state => state['phone.apps.phone'].calls);
  const classes = styles();
  const actions: Action[] = [
    {
      title: 'Bel terug',
      icon: 'phone',
      onClick: e => {
        if (!e.number) return;
        startPhoneCall(e.number);
      },
    },
    {
      title: 'Toevoegen aan contacten',
      icon: 'user-plus',
      onClick: e => {
        if (!e.number) return;
        if (getContact(e.number)) {
          addNotification({
            id: 'phoneapp-history-contact-exists',
            title: 'Phone',
            description: 'Contact bestaat al',
            icon: 'phone',
          });
          return;
        }
        showFormModal(
          <ContactModal
            contact={{
              phone: e.number,
            }}
            type={'new'}
          />
        );
      },
    },
  ];
  return (
    <div className={classes.list}>
      {calls.map(c => (
        <Paper
          key={`${c.name ?? c.number ?? ''}${c.date}`}
          actions={actions.map(a => ({ ...a, _data: c }))}
          image={<i className={`fas fa-phone${c.incoming ? '-alt' : ''}`} />}
          title={c.name ?? c.number ?? ''}
          description={formatRelativeTime(c.date)}
        />
      ))}
      {calls.length === 0 && (
        <div className={'emptylist'}>
          <i className='fas fa-frown' />
          <p>Geen gesprekken</p>
        </div>
      )}
    </div>
  );
};
