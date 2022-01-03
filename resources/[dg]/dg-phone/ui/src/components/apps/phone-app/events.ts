import { endPhoneCall, setActiveCall, setIncomingCall, startPhoneCall } from '../../../lib/call';

export const events: any = {};

events.endCurrentCall = endPhoneCall;
events.incomingCall = setIncomingCall;
events.setCallActive = setActiveCall;
events.startAnonCall = (nr: string) => startPhoneCall(nr, true);
