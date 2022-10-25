import { Events, Keys, PolyZone, RPC, UI, Util } from '@dgx/client';

import { Spot } from './Spot';

class ShopManager extends Util.Singleton<ShopManager>() {
  private _inShop = false;
  private spots: Map<number, Spot>;
  private _activeSpot: number | null = null;

  constructor() {
    super();
    this.spots = new Map();
  }

  //#region getters/setters
  public get activeSpot() {
    return this._activeSpot;
  }
  private set activeSpot(value: typeof this._activeSpot) {
    this._activeSpot = value;
  }
  public get inShop() {
    return this._inShop;
  }
  private set inShop(value: typeof this._inShop) {
    this._inShop = value;
    Events.emitNet('vehicles:shop:setActive', value);
  }
  //#endregion

  public enteredShop = async () => {
    this.inShop = true;
    // Build Spots
    const carSpots = await RPC.execute<Record<number, VehicleShop.Spot>>('vehicles:shop:getCarSpots');
    if (!carSpots) return;
    Object.entries(carSpots).forEach(([id, data]) => {
      const spot = new Spot(Number(id), data);
      this.spots.set(spot.id, spot);
    });
  };

  public leftShop = () => {
    this.inShop = false;
    this.clearSpots();
    PolyZone.removeZone('pdm_spot');
  };

  private clearSpots = () => {
    this.spots.forEach(spot => {
      spot.despawnVehicle();
    });
    this.spots.clear();
  };

  public getSpot = (id: number) => {
    return this.spots.get(id);
  };

  public enteredSpot = (id: number) => {
    if (this.activeSpot) return;
    if (!this.spots.has(id)) return;
    this.activeSpot = id;
    UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Voertuig`);
  };

  public leftSpot = (id: number) => {
    if (this.activeSpot !== id) return;
    if (!this.spots.has(id)) return;
    this.activeSpot = null;
    setTimeout(() => {
      if (this.activeSpot !== null) return;
      UI.hideInteraction();
    }, 500);
  };
}

const shopManager = ShopManager.getInstance();
export default shopManager;
