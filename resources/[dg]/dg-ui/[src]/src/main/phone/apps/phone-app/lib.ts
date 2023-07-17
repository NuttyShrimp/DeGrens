import { nuiAction } from '../../../../lib/nui-comms';
import { addNotification, removeNotification, updateNotification } from '../../lib';
import { usePhoneStore } from '../../stores/usePhoneStore';
import { getContact } from '../contacts-app/lib';

import { usePhoneAppStore } from './stores/usePhoneAppStore';

const addCallEntry = (name: string, number: string, date: number, incoming: boolean) => {
  usePhoneAppStore.setState(s => ({
    calls: [
      ...s.calls,
      {
        name,
        number,
        date,
        incoming,
      },
    ],
  }));
};

// region Call logic
const phoneCallNotiId = `__internal_phone_call_noti__`;
let incoming = false;

export const startPhoneCall = (nr: string, type: Phone.Phone.CallType = 'normal') => {
  nuiAction('phone/startCall', {
    phone: nr,
    type,
  });
  usePhoneStore.setState({
    callMeta: {
      number: nr,
      type,
    },
  });
  addNotification({
    id: phoneCallNotiId,
    title: getContact(nr)?.label ?? nr,
    description: 'Calling...',
    icon: 'phone',
    sticky: true,
    onDecline: () => {
      // Event tries to end current call server sided, if any
      nuiAction('phone/dispatchEndCall');
    },
  });
};

export const endPhoneCall = () => {
  // Event does not end the call on other end just does cleanup
  updateNotification(phoneCallNotiId, {
    description: 'Call ended',
  });
  removeNotification(phoneCallNotiId);
  const callMeta = usePhoneStore.getState().callMeta;
  const contact = getContact(callMeta.number);
  if (!callMeta.isAnon) {
    addCallEntry(contact?.label ?? callMeta.number, contact?.phone ?? callMeta.number, Date.now(), incoming);
  }
  usePhoneStore.setState({
    callMeta: {},
  });
  incoming = false;
};

export const setIncomingCall = (data: { label: string; type: number }) => {
  incoming = true;
  const contact = data.label.startsWith('0') ? getContact(data.label) : { label: data.label };
  usePhoneStore.setState({
    callMeta: {
      number: data.label,
      type: data.type,
    },
  });
  addNotification({
    id: phoneCallNotiId,
    title: contact?.label ?? data.label,
    description: 'Incoming call...',
    icon: 'phone',
    keepOnAction: true,
    sticky: true,
    onAccept: () => {
      nuiAction('phone/acceptCall');
    },
    onDecline: () => {
      nuiAction('phone/declineCall');
    },
  });
};

export const setActiveCall = () => {
  updateNotification(phoneCallNotiId, {
    description: 'in call...',
    timer: 0,
    onAccept: undefined,
  });
};
// endregion
