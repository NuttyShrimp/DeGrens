declare namespace Weapons {
  type Config = {
    attachmentItems: string[];
    ammo: Record<string, { ammoType: string; amount: number }>;
    weapons: Record<string, WeaponConfig>;
  };

  type WeaponConfig = {
    name: string;
    durabilityMultiplier: number;
    noHolstering?: boolean;
    canTint?: boolean;
    oneTimeUse?: boolean;
    unlimitedAmmo?: boolean;
    attachments?: Record<string, string>;
    useNativeReticle?: boolean;
  };

  type WeaponItem = Inventory.ItemState &
    Required<Pick<WeaponConfig, 'noHolstering' | 'oneTimeUse' | 'canTint' | 'useNativeReticle'>> & {
      hash: number;
    };

  type EquippedData = {
    removeTimeout: NodeJS.Timeout | null;
    weaponHash: number;
  };
}
