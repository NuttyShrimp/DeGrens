class Weapons {
  getCurrentWeaponData = (): Inventory.ItemState | null => {
    return global.exports['dg-weapons'].getCurrentWeaponData();
  };

  showReticle = (show: boolean) => {
    global.exports['dg-weapons'].showReticle(show);
  };

  removeWeapon = (itemId?: string, skipAnimation = false) => {
    global.exports['dg-weapons'].removeWeapon(itemId, skipAnimation);
  };

  public onFreeAimStart = (handler: (weaponItem: Inventory.ItemState) => void) => {
    on('weapons:startedFreeAiming', handler);
  };

  public onFreeAimStop = (handler: (weaponItem: Inventory.ItemState) => void) => {
    on('weapons:stoppedFreeAiming', handler);
  };

  public onShotFired = (handler: (weaponItem: Inventory.ItemState) => void) => {
    on('weapons:shotWeapon', handler);
  };
}

export default {
  Weapons: new Weapons(),
};
