import { Admin, Events, SQL, Util } from '@dgx/server';
import { DGXEvent, EventListener } from '@dgx/server/decorators';
import { getModule } from 'moduleController';
import { Player } from './classes/player';
import { characterLogger } from './logger.character';
import { userManager } from 'modules/users/managers/userManager';

@EventListener()
export class CharacterModule implements Modules.ServerModule, Core.ServerModules.CharacterModule {
  private characterOwners: Record<string, number[]> = {};
  // ServerId to character
  private activeCharacters: Record<number, Core.Characters.OnlinePlayer> = {};
  // CID to serverId
  private cidToServerId: Record<number, number> = {};
  private saveIntervals: Record<number, NodeJS.Timeout> = {};
  private phoneNumbersMarkedAsUsed = new Set<string>(); // set contains phone numbers that got marked as used by other resources

  private async loadCharOwnership() {
    this.characterOwners = {};
    const steamIdToCid = await SQL.query<{ citizenid: number; steamid: string }[]>(
      'SELECT citizenid, steamid FROM characters'
    );
    steamIdToCid.forEach(e => {
      this.addCharacterToOwner(e.steamid, e.citizenid);
    });
  }

  private addCharacterToOwner(steamId: string, cid: number) {
    (this.characterOwners[steamId] ??= []).push(cid);
  }

  private doesUserOwnCharacter(src: number, cid: number) {
    const userModule = getModule('users');
    const steamid = userModule.getPlyIdentifiers(src).steam;
    const chars = this.characterOwners?.[steamid] ?? [];
    return chars.find(c => c === cid);
  }

  onStart() {
    this.loadCharOwnership();
  }

  onPlayerDropped(src: number) {
    this.logout(src);
  }

  selectCharacter = async (src: number, cid: number) => {
    if (this.activeCharacters[src]) {
      await this.logout(src);
    }
    if (this.saveIntervals[src]) {
      clearInterval(this.saveIntervals[src]);
      delete this.saveIntervals[src];
    }
    if (!this.doesUserOwnCharacter(src, cid)) {
      Admin.ACBan(src, "Trying to login as a character you don't own");
      return false;
    }

    const ply = await Player.build(cid);
    if (!ply) {
      characterLogger.error(`Failed to load character ${cid}`);
      return false;
    }

    characterLogger.info(`Player ${src} is logging in as ${cid}`);
    global.Player(src).state.set('isLoggedIn', true, true);
    global.Player(src).state.set('citizenid', cid, true);
    ply.linkUser(src);

    this.activeCharacters[src] = ply as Core.Characters.OnlinePlayer;
    this.cidToServerId[cid] = src;

    emit('core:characters:loaded', ply);
    Events.emitNet('core:characters:loaded', src, ply);
    Events.emitNet('core:character:set', src, ply.metadata, ply.charinfo);
    this.saveIntervals[src] = setInterval(() => {
      ply.save();
    }, 5 * 60000);
    return true;
  };

  createCharacter = async (
    src: number,
    charData: Omit<Core.Characters.Charinfo, 'cash' | 'phone'>
  ): Promise<boolean> => {
    const userModule = getModule('users');
    const steamid = userModule.getPlyIdentifiers(src).steam;
    if (!steamid) {
      DropPlayer(String(src), 'Unable to find steamId while creating new character');
      return false;
    }

    const result = await SQL.query<{ citizenid: number }[]>(
      'INSERT INTO characters (steamid) VALUES (?) RETURNING citizenid',
      [steamid]
    );
    if (!result || !result[0]) {
      characterLogger.error(`Failed to insert a new character`, { steamid });
      return false;
    }
    const cid = result[0].citizenid;
    const ply = await Player.build(cid, charData);
    if (!ply) {
      characterLogger.error(`Failed to load newly created character`, { steamid });
      return false;
    }
    ply.linkUser(src); // we link to get proper logs in the save function
    await ply.save();
    this.addCharacterToOwner(steamid, cid);
    this.selectCharacter(src, cid);
    return true;
  };

  logout = async (src: number) => {
    if (this.saveIntervals[src]) {
      clearInterval(this.saveIntervals[src]);
      delete this.saveIntervals[src];
    }
    const ply = this.activeCharacters[src];
    if (!ply) return;
    emit('core:characters:unloaded', src, ply.citizenid, ply);
    Events.emitNet('core:characters:unloaded', src, ply.citizenid);
    global.exports['dg-chars'].addDroppedPlayer(ply.citizenid);
    await ply.save();
    global.Player(src).state.set('isLoggedIn', false, true);
    global.Player(src).state.set('citizenid', null, true);
    delete this.cidToServerId[ply.citizenid];
    delete this.activeCharacters[src];
  };

  deleteCharacter = async (src: number, cid: number) => {
    if (!this.doesUserOwnCharacter(src, cid)) {
      Admin.ACBan(src, "Trying to delete a character you don't own", { cid });
      return;
    }
    const ply = await this.getOfflinePlayer(cid);
    if (!ply) {
      characterLogger.warn(`${Util.getName(src)}(${src}) tried to delete an unexisting character: ${cid}`);
      return;
    }
    this.logout(src);
    await SQL.query('DELETE FROM characters WHERE citizenid = ?', [cid]);
    Util.Log(
      'core:character:deleted',
      {
        cid,
      },
      `${Util.getName(src)} just deleted his character: ${ply.charinfo.firstname} ${ply.charinfo.lastname} - ${cid}`,
      src
    );
  };

  getAllPlayers = () => {
    return this.activeCharacters;
  };

  @DGXEvent('core:character:loadPlayer')
  loadPlayer(src: number) {
    const ply = this.activeCharacters[src];
    if (!ply) return;
    Events.emitNet('core:character:set', src, ply.metadata, ply.charinfo);
  }

  getPlayer = (src: number) => {
    return this.activeCharacters[src];
  };

  getPlayerByCitizenId = (cid: number) => {
    const serverId = this.getServerIdFromCitizenId(cid);
    if (!serverId) return;
    return this.activeCharacters[serverId];
  };

  getPlayerBySteamId = (steamid: string) => {
    const serverId = userManager.getUserByIdentifier(steamid);
    if (!serverId) return;
    return this.activeCharacters[serverId];
  };

  getPlayerByPhone = (phone: string) => {
    const ply = Object.values(this.activeCharacters).find(p => p.charinfo.phone === phone);
    return ply;
  };

  getOfflinePlayer = async (cid: number): Promise<Core.Characters.Player | undefined> => {
    const serverId = this.getServerIdFromCitizenId(cid);
    if (serverId) {
      return this.activeCharacters[serverId];
    }

    const ply = await Player.build(cid);
    return ply;
  };

  getOfflinePlayerByPhone = async (phone: string) => {
    const existingPlayer = this.getPlayerByPhone(phone);
    if (existingPlayer) {
      return existingPlayer;
    }

    if (typeof phone !== 'string') {
      phone = String(phone);
    }

    // If no player with phone is loaded, try building new if it exists in db
    const result = await SQL.query<{ citizenid: number }[]>('SELECT citizenid FROM character_info WHERE phone = ?', [
      phone,
    ]);
    const cid: number | undefined = result?.[0]?.citizenid;
    if (!cid) return;

    return await Player.build(cid);
  };

  getServerIdFromCitizenId = (cid: number): number | undefined => {
    return this.cidToServerId[cid];
  };

  getCitizenIdsFromSteamId = (steamid: string) => {
    return this.characterOwners[steamid] ?? [];
  };

  generatePhone = async (markAsUsed = false) => {
    let uniqueFound = false;
    let phone = `04${Util.getRndInteger(70, 100)}${Util.getRndInteger(100000, 999999)}`;
    while (uniqueFound) {
      const result = await SQL.query('SELECT COUNT(*) as count FROM character_info WHERE phone LIKE ?', [phone]);
      if (result?.[0].count == 0 && !this.phoneNumbersMarkedAsUsed.has(phone)) {
        uniqueFound = true;
      } else {
        phone = `04${Util.getRndInteger(70, 100)}${Util.getRndInteger(100000, 999999)}`;
      }
    }

    if (markAsUsed) {
      this.phoneNumbersMarkedAsUsed.add(phone);
    }

    return phone;
  };
}
