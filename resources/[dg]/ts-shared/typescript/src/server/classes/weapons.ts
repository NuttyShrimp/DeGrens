class Weapons {
  forceSetAmmo = (plyId: number, amount: number) => {
    global.exports['dg-weapons'].forceSetAmmo(plyId, amount);
  };

  forceSetQuality = (plyId: number, quality: number) => {
    global.exports['dg-weapons'].forceSetQuality(plyId, quality);
  };

  getPlayerEquippedWeapon = (plyId: number): number => {
    return global.exports['dg-weapons'].getPlayerEquippedWeapon(plyId);
  };
}

export default {
  Weapons: new Weapons(),
};
