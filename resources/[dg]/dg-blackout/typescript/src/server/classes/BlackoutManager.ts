import { Chat, Util, Events } from '@dgx/server';

class BlackoutManager extends Util.Singleton<BlackoutManager>() {
  private _state = false;
  private flickeringThread: NodeJS.Timer;
  private flickeringTimeout: NodeJS.Timeout;

  get state() {
    return this._state;
  }

  set state(value: boolean) {
    if (value === this.state) return;
    this._state = value;
    Chat.sendMessage(-1, {
      prefix: 'DG Departement Energie: ',
      message: this.state
        ? 'We onderzoeken de oorzaak van de actuele stroompanne.'
        : 'De stroompanne is opgelost. Excuses voor het ongemak.',
      type: 'system',
    });
    Events.emitNet('blackout:client:setBlackout', -1, this.state);
    if (this.state) this.startFlickeringThread();
  }

  private startFlickeringThread = () => {
    clearTimeout(this.flickeringTimeout);
    this.flickeringTimeout = setTimeout(() => {
      this.flickeringThread = setInterval(() => {
        if (!this.state) {
          clearInterval(this.flickeringThread);
          this.flickeringThread = null;
          return;
        }
        if (Util.getRndInteger(1, 100) <= 20) Events.emitNet('blackout:client:flicker', -1);
      }, 1000);
    }, 5000);
  };
}

const blackoutManager = BlackoutManager.getInstance();
export default blackoutManager;
