import { Util, PolyZone } from '@dgx/client';

class BlackoutManager extends Util.Singleton<BlackoutManager>() {
  private _state = false;
  private _inSafezone = false;

  get state() {
    return this._state;
  }

  set state(value: boolean) {
    this._state = value;
    this.disableLights(this.state);
  }

  get inSafezone() {
    return this._inSafezone;
  }

  set inSafezone(value: boolean) {
    this._inSafezone = value;
    this.disableLights(this.state);
  }

  private disableLights = (state: boolean) => {
    SetArtificialLightsState(state);
    SetArtificialLightsStateAffectsVehicles(false);
  };

  flicker = () => {
    if (!this.inSafezone) return;
    this.disableLights(true);
    setTimeout(() => {
      if (!this.inSafezone || !this.state) return;
      this.disableLights(false);
    }, 300);
  };
}

const blackoutManager = BlackoutManager.getInstance();
export default blackoutManager;
