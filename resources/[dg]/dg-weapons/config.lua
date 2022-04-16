Config = Config or {}

Config.ReloadTime = 5 * 1000 -- In ms
Config.Ammo = {
    ['pistol_ammo'] = {
        ammoType = `AMMO_PISTOL`,
        amount = 50,
    },
    ['smg_ammo'] = {
        ammoType = `AMMO_SMG`,
        amount = 50,
    },
    ['shotgun_ammo'] = {
        ammoType = `AMMO_SHOTGUN`,
        amount = 50,
    },
    ['rifle_ammo'] = {
        ammoType = `AMMO_RIFLE`,
        amount = 50,
    },
    ['mg_ammo'] = {
        ammoType = `AMMO_MG`,
        amount = 50,
    },
    ['sniper_ammo'] = {
        ammoType = `AMMO_SNIPER`,
        amount = 50,
    },
}

-- TODO: Itemimages for these
Config.Attachments = {'luxuryfinish', 'flashlight', 'pistol_extendedclip', 'smg_extendedclip', 'shotgun_extendedclip', 'rifle_extendedclip', 'mg_extendedclip', 'sniper_extendedclip', 'pistol_suppressor', 'smg_suppressor', 'shotgun_suppressor', 'rifle_suppressor', 'sniper_suppressor', 'pistol_scope', 'smg_scope', 'rifle_scope', 'sniper_scope', 'smg_drum', 'shotgun_drum', 'rifle_drum',}