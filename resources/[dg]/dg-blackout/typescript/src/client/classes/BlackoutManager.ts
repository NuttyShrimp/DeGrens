import { Util } from '@dgx/client';

class BlackoutManager extends Util.Singleton<BlackoutManager>() {
  private statebag: Blackout.Statebag;
  private lightsDisabled: boolean;
  private inSafezone: boolean;

  constructor() {
    super();
    this.statebag = {
      blackout: false,
      safezones: false,
    };
    this.lightsDisabled = false;
    this.inSafezone = false;
  }

  public loadStateBag = (statebag: Blackout.Statebag) => {
    this.statebag = statebag;
    this.disableLights(this.shouldDisableLights());
  };

  public setInSafeZone = (inSafezone: boolean) => {
    this.inSafezone = inSafezone;
    this.disableLights(this.shouldDisableLights());
  };

  private disableLights = (state: boolean) => {
    if (this.lightsDisabled === state) return;

    this.lightsDisabled = state;
    SetArtificialLightsState(this.lightsDisabled);
    SetArtificialLightsStateAffectsVehicles(false);
  };

  public flicker = () => {
    if (!this.inSafezone) return;

    this.disableLights(true);
    setTimeout(() => {
      this.disableLights(this.shouldDisableLights());
    }, 300);
  };

  private shouldDisableLights = () => this.statebag.blackout && !(this.statebag.safezones && this.inSafezone);
}

const blackoutManager = BlackoutManager.getInstance();
export default blackoutManager;
