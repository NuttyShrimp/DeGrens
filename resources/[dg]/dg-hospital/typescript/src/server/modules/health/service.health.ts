import { Util } from '@dgx/server';
import { getHospitalConfig } from 'services/config';

const APPLY_ON_DAMAGE = ['gsw', 'stabwound'];

const onDamageStatusses: Map<number, StatusName> = new Map();

export const getOnDamageStatusFromWeapon = (weapon: number) => onDamageStatusses.get(weapon);

export const loadOnDamageStatusses = () => {
  const weapons = Object.entries(getHospitalConfig().damagetypes);

  for (const [name, data] of weapons) {
    if (APPLY_ON_DAMAGE.includes(data.status)) {
      const hash = Util.getHash(name);
      onDamageStatusses.set(hash, data.status);
    }
  }
};
