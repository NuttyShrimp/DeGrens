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
}

export default {
  Weapons: new Weapons(),
};
