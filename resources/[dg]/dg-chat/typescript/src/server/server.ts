import './helpers/messages';
import './helpers/commands';

let initInterval: NodeJS.Timeout;

setImmediate(() => {
  initInterval = setInterval(() => {
    if (GetResourceState('dg-chat') === 'started') {
      clearInterval(initInterval);
      // On this emit resources should start adding the custom commands
      emit('chat:startedChat');
    }
  }, 100);
});
