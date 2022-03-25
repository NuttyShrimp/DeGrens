import { nuiAction } from '../../../../lib/nui-comms';
import { addNotification, genericAction, getState, removeNotification, updateNotification } from '../../lib';
import { getContact } from '../contacts-app/lib';

const addCallEntry = (name: string, number: string, date: number, incoming: boolean) => {
  const calls = getState<Phone.Phone.State>('phone.apps.phone').calls;
  calls.push({
    name,
    number,
    date,
    incoming,
  });
  genericAction('phone.apps.phone', { calls });
};

// region Call logic
const phoneCallNotiId = `__internal_phone_call_noti__`;
let incoming = false;

export const startPhoneCall = (nr: string, isAnon = false) => {
  nuiAction('phone/startCall', {
    phone: nr,
    isAnon,
  });
  genericAction('phone', {
    callMeta: {
      number: nr,
      isAnon,
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
  nuiAction('phone/endcall');
  removeNotification(phoneCallNotiId);
  const callMeta = getState().callMeta;
  const contact = getContact(callMeta.number);
  if (!callMeta.isAnon) {
    addCallEntry(contact?.label ?? callMeta.number, contact?.phone ?? '', Date.now(), incoming);
  }
  genericAction('phone', {
    callMeta: {},
  });
  incoming = false;
};

export const setIncomingCall = (data: { label: string; isAnon: boolean }) => {
  incoming = true;
  const contact = getContact(data.label);
  genericAction('phone', {
    callMeta: {
      number: data.label,
      isAnon: data.isAnon,
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
