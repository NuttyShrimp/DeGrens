declare namespace Weapons {
  type Config = {
    attachments: string[];
    ammo: Record<string, { ammoType: string; amount: number }>;
  };

  type WeaponConfig = {
    name: string;
    durabilityMultiplier: number;
    noHolstering?: boolean;
    canTint?: boolean;
    oneTimeUse?: boolean;
    unlimitedAmmo?: boolean;
    attachments?: Record<string, string>;
  };

  type WeaponItem = Inventory.ItemState & { hash: number; oneTimeUse: boolean; noHolstering: boolean };
}
