declare namespace Weapons {
  type Config = {
    attachmentItems: string[];
    ammo: Record<string, { ammoType: string; amount: number }>;
    weapons: Record<string, WeaponConfig>;
  };

  type WeaponConfig = Optional<SharedWeaponConfig> & {
    name: string;
    durabilityMultiplier: number;
    unlimitedAmmo?: boolean;
    attachments?: Record<string, string>;
  };

  type SharedWeaponConfig = {
    noHolstering: boolean;
    canTint: boolean;
    oneTimeUse: boolean;
    useNativeReticle: boolean;
    damageModifier: number;
    isMelee: boolean;
    dispatchAlertChance: number;
  };

  type WeaponItem = Inventory.ItemState &
    SharedWeaponConfig & {
      hash: number;
    };

  type EquippedData = {
    removeTimeout: NodeJS.Timeout | null;
    weaponHash: number;
  };
}
