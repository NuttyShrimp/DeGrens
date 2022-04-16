# Weapon Data

```ts
interface WeaponData {
  name: string; // Weapon Name
  durabilityMultiplier: number; // Multiplier for durability, can be 0 for unlimited durability
  noHolstering?: bool; // Should this weapon have a holstering animation
  unlimitedAmmo?: bool; // Should this weapon have unlimited ammo
  oneTimeUse?: bool; // Should this weapon be removed after usage
  attachments?: {[itemName: string] : string}
}
```
