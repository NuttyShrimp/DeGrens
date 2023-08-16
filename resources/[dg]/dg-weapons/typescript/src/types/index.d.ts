declare namespace Weapons {
  type Config = {
    attachmentItems: string[];
    ammo: Record<string, { ammoType: string; amount: number }>;
    weapons: Record<string, WeaponConfig>;
  };

  type WeaponConfig = Optional<SharedWeaponConfig> & {
    name: string;
    durabilityDecreasePerShot: number;
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
    blockInVehicle: boolean;
  };

  type WeaponItem = Inventory.ItemState<WeaponItemMetadata> &
    SharedWeaponConfig & {
      hash: number;
    };

  type EquippedData = {
    removeTimeout: NodeJS.Timeout | null;
    weaponHash: number;
  };

  type WeaponItemMetadata = { serialnumber: string; ammo?: number; tint?: string };
}
