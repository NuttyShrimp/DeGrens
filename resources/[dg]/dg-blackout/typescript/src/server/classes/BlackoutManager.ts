import { Chat, Util } from '@dgx/server/classes';

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
    emitNet('dg-blackout:client:SetBlackout', -1, this.state);
    if (this.state) this.startFlickeringThread();
  }

  // 5% chance of lights flickering
  private startFlickeringThread = () => {
    clearTimeout(this.flickeringTimeout);
    this.flickeringTimeout = setTimeout(() => {
      this.flickeringThread = setInterval(() => {
        if (!this.state) {
          clearInterval(this.flickeringThread);
          this.flickeringThread = null;
          return;
        }
        if (Util.getRndInteger(1, 100) <= 20) emitNet('dg-blackout:client:Flicker', -1);
      }, 1000);
    }, 5000);
  };
}

const blackoutManager = BlackoutManager.getInstance();
export default blackoutManager;
