// Cmds to print a table with all registered events and there handlers for a resource
import { Util } from '../../../../packages/server/src/classes';

if (Util.isDevEnv() && GetCurrentResourceName() === 'ts-shared') {
  RegisterCommand(
    'showDGXEvents',
    (source: number, args: string[]) => {
      if (source !== 0) return;
      if (args.length < 1) {
        console.log('Gotta give me a resource buddy');
        return;
      }
      const resource = args[0];
      emit('dgx:events:showEventsTable', resource);
    },
    true
  );

  RegisterCommand(
    'showDGXRPC',
    (source: number, args: string[]) => {
      if (source !== 0) return;
      if (args.length < 1) {
        console.log('Gotta give me a resource buddy');
        return;
      }
      const resource = args[0];
      emit('dgx:events:showRPCTable', resource);
    },
    true
  );
}
