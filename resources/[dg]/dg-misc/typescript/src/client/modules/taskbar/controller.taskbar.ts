import { Keys, Events } from '@dgx/client';
import { cancelTaskbar, taskbar } from './service.taskbar';

global.exports('Taskbar', taskbar);

Keys.register('taskbar-cancel', 'Taskbar Annuleren', 'ESCAPE');
Keys.onPressDown('taskbar-cancel', cancelTaskbar);

Events.onNet(
  'misc:taskbar:new',
  async (id: string, icon: string, label: string, duration: number, settings: TaskBar.TaskBarSettings) => {
    const [wasCanceled, atPercentage] = await taskbar(icon, label, duration, settings, id);
    Events.emitNet('misc:taskbar:finished', id, wasCanceled, atPercentage);
  }
);
