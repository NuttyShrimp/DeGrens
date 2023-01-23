import { Chat, Events, Util } from '@dgx/server';

class BlackoutManager extends Util.Singleton<BlackoutManager>() {
  private _state = false;
  private flickeringThread: NodeJS.Timer | null = null;
  private flickeringTimeout: NodeJS.Timeout | null = null;

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
    this.setStatebag(this.state);
    if (this.state) this.startFlickeringThread();
  }

  public setStatebag = (state: boolean) => {
    GlobalState.blackout = state;
  };

  private startFlickeringThread = () => {
    if (this.flickeringTimeout) {
      clearTimeout(this.flickeringTimeout);
    }

    this.flickeringTimeout = setTimeout(() => {
      if (this.flickeringThread) {
        clearInterval(this.flickeringThread);
        this.flickeringThread = null;
      }

      this.flickeringThread = setInterval(() => {
        if (!this.state) {
          if (this.flickeringThread) {
            clearInterval(this.flickeringThread);
            this.flickeringThread = null;
          }
          return;
        }
        if (Util.getRndInteger(1, 100) <= 20) Events.emitNet('blackout:client:flicker', -1);
      }, 1000);
    }, 5000);
  };
}

const blackoutManager = BlackoutManager.getInstance();
export default blackoutManager;
