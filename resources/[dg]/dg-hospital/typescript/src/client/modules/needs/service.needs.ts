import { Core, Notifications, Util } from '@dgx/client';
import { getHealth, setHealth } from 'modules/health/service.health';

let needsThread: NodeJS.Timer | null = null;

export const startNeedsThread = () => {
  if (needsThread !== null) return;
  let charModule = Core.getModule('characters');

  needsThread = setInterval(() => {
    const needs = charModule.getMetadata().needs;
    if (Object.values(needs).every(n => n > 0)) return;
    const health = getHealth();
    setHealth(health - Util.getRndInteger(5, 10));
    Notifications.add('Je voelt je niet zo lekker');
  }, 10000);
};

export const cleanNeedsThread = () => {
  if (needsThread === null) return;
  clearInterval(needsThread);
  needsThread = null;
};
