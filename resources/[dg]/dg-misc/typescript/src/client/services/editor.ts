import { Events, Notifications } from '@dgx/client';

Events.onNet('misc:editor:start', () => {
  if (IsRecording()) {
    Notifications.add('Je bent al aan het opnemen', 'error');
    return;
  }

  StartRecording(1);
  Notifications.add('Opname gestart');
});

Events.onNet('misc:editor:stop', () => {
  if (!IsRecording()) {
    Notifications.add('Je bent niet aan het opnemen', 'error');
    return;
  }

  StopRecordingAndSaveClip();
  Notifications.add('Opname opgeslagen');
});
