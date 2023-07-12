declare namespace Calls {
  type CallState = 'outgoing' | 'established' | 'ended';

  type IncomingCall = {
    label: string;
    type: CallType;
    soundId: number;
  };

  type Call = {
    id: number;
    caller: number;
    target?: number;
    state: CallState;
    type: CallType;
  };

  type CallType = 'normal' | 'anon' | 'prison';
}
