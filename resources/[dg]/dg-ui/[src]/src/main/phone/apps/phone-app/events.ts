import { endPhoneCall, setActiveCall, setIncomingCall, startPhoneCall } from './lib';

export const events: Phone.Events = {};
events.endCurrentCall = endPhoneCall;
events.incomingCall = setIncomingCall;
events.setCallActive = setActiveCall;
events.startAnonCall = (nr: string) => startPhoneCall(nr, true);
