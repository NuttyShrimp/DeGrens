import { Util, Vehicles } from '@dgx/server';

const generateWeaponSerial = () => {
  return (
    Util.generateRndChar(5) +
    '-' +
    Util.generateRndChar(5) +
    '-' +
    Util.generateRndChar(5) +
    '-' +
    Util.generateRndChar(5)
  );
};

export const ON_CREATE: Record<string, (plyId?: number) => { [key: string]: any }> = {
  weapon_advancedrifle: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_appistol: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_assaultrifle: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_assaultrifle_mk2: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_assaultshotgun: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_assaultsmg: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_autoshotgun: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_bullpuprifle: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_bullpuprifle_mk2: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_bullpupshotgun: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_carbinerifle: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_carbinerifle_mk2: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_ceramicpistol: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_combatmg: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_combatmg_mk2: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_combatpdw: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_combatpistol: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_combatshotgun: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_compactlauncher: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_compactrifle: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_dbshotgun: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_doubleaction: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_firework: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_flaregun: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_grenade: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_grenadelauncher: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_grenadelauncher_smoke: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_gusenberg: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_heavypistol: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_heavyshotgun: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_heavysniper: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_heavysniper_mk2: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_hominglauncher: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_machinepistol: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_marksmanrifle: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_marksmanrifle_mk2: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_mg: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_microsmg: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_militaryrifle: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_minigun: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_minismg: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_musket: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_navyrevolver: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_pipebomb: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_pistol: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_pistol50: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_pistol_mk2: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_proxmine: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_pumpshotgun: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_pumpshotgun_mk2: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_railgun: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_raycarbine: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_rayminigun: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_raypistol: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_remotesniper: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_revolver: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_revolver_mk2: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_rpg: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_sawnoffshotgun: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_smg: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_smg_mk2: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_smokegrenade: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_sniperrifle: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_snspistol: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_snspistol_mk2: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_specialcarbine: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_specialcarbine_mk2: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_stickybomb: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_stungun: () => ({ serialnumber: generateWeaponSerial() }),
  weapon_vintagepistol: () => ({ serialnumber: generateWeaponSerial() }),
  id_card: (plyId?: number) => {
    if (!plyId) return {};
    const playerData = DGCore.Functions.GetPlayer(plyId).PlayerData;
    return {
      cid: playerData.citizenid,
      firstName: playerData.charinfo.firstname,
      lastName: playerData.charinfo.lastname,
      dob: playerData.charinfo.birthdate,
      gender: playerData.charinfo.gender == 0 ? 'M' : 'V',
      nationality: playerData.charinfo.nationality.toUpperCase().slice(0, 3),
    };
  },
  fakeplate: () => ({ plate: Vehicles.generatePlate() }),
  weed_seed: () => ({ gender: Math.random() > 0.5 ? 'male' : 'female' }),
  weed_bud: () => ({ hiddenKeys: ['hiddenKeys', 'createTime'], createTime: Math.round(Date.now() / 1000) }),
};
