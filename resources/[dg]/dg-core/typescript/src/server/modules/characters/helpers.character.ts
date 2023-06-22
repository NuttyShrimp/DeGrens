import { SQL } from '@dgx/server';
import { Util } from '@dgx/shared';

export const generateDNA = async () => {
  let uniqueFound = false;
  let dna = `${Util.getRndString(15, true)}`;
  while (uniqueFound) {
    const result = await SQL.query('SELECT COUNT(*) as count FROM character_data WHERE `metadata` LIKE %?%', [dna]);
    if (result?.[0].count == 0) {
      uniqueFound = true;
    } else {
      dna = `${Util.getRndString(15, true)}`;
    }
  }
  return dna;
};

export const generatePhone = async () => {
  let uniqueFound = false;
  let phone = `04${Util.getRndInteger(70, 100)}${Util.getRndInteger(100000, 999999)}`;
  while (uniqueFound) {
    const result = await SQL.query('SELECT COUNT(*) as count FROM character_info WHERE phone LIKE ?', [phone]);
    if (result?.[0].count == 0) {
      uniqueFound = true;
    } else {
      phone = `04${Util.getRndInteger(70, 100)}${Util.getRndInteger(100000, 999999)}`;
    }
  }
  return phone;
};

export const defaultMetadata: Core.Characters.Metadata = {
  armor: 0,
  armorItem: null,
  health: 200,
  stress: 0,
  cash: 500,
  callsign: 'NO CALLSIGN',
  inside: {
    house: undefined,
    apartment: {
      id: undefined,
    },
  },
  dna: '',
  jailMonths: -1,
  downState: 'alive',
  needs: {
    hunger: 100,
    thirst: 100,
  },
};

export const defaultCharinfo: Core.Characters.Charinfo = {
  firstname: 'John',
  lastname: 'Doe',
  birthdate: '1990-01-01',
  nationality: 'Belg',
  gender: 0,
  phone: '',
};
