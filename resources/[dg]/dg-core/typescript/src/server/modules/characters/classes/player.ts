import { SQL, Util, Sync } from '@dgx/server';
import { getModule } from 'moduleController';
import { characterLogger } from '../logger.character';
import { defaultCharinfo, defaultMetadata, generateDNA, generatePhone } from '../helpers.character';
import { mainLogger } from 'sv_logger';

export class Player {
  name: string;
  steamId: string;
  serverId?: number;
  citizenid: number;
  charinfo: Core.Characters.Charinfo;
  position: Vec3;
  metadata: Core.Characters.Metadata;

  constructor(
    cid: number,
    steamId: string,
    charinfo: Core.Characters.Charinfo,
    metadata: Core.Characters.Metadata,
    position: Vec3
  ) {
    this.citizenid = cid;
    this.steamId = steamId;
    this.serverId = undefined;
    this.name = '';
    this.charinfo = charinfo;
    this.metadata = metadata;
    this.position = position;

    this.validateMetadata();
  }

  private async validateMetadata() {
    for (const key of Object.keys(defaultMetadata) as (keyof Core.Characters.Metadata)[]) {
      if (this.metadata?.[key] === undefined) {
        if (key === 'dna') {
          this.metadata.dna = await generateDNA();
          continue;
        }
        // @ts-ignore TS being a bitch
        this.metadata[key] = defaultMetadata[key];
      }
    }
  }

  linkUser = (src: number) => {
    this.serverId = src;
    this.name = GetPlayerName(String(src));
  };

  save = async () => {
    if (this.serverId) {
      // This makes it still save last coords when ply leaves server
      const plyCoords = Sync.getPlayerCoords(this.serverId);
      if (plyCoords) {
        this.position = plyCoords;
      }

      const ped = GetPlayerPed(String(this.serverId));
      if (ped) {
        this.updateMetadata('health', Math.max(GetEntityHealth(ped), 100));
        this.updateMetadata('armor', GetPedArmour(ped));
        this.position = Util.getPlyCoords(this.serverId);
      }

      const userModule = getModule('users');
      await userModule.saveUser(this.serverId);
    }

    const charResult = await SQL.query(
      `
      INSERT INTO characters (citizenid, steamid, last_updated) VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE last_updated = NOW()
    `,
      [this.citizenid, this.steamId]
    );
    if (charResult.affectedRows === 0) {
      characterLogger.warn(`Failed to save character ${this.citizenid} | ${this.name}(${this.serverId})`);
      return;
    }

    const charDataResult = await SQL.query(
      `
      INSERT INTO character_data (citizenid, position, metadata) VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE position = VALUES(position), metadata = VALUES(metadata), last_updated = NOW()
    `,
      [this.citizenid, JSON.stringify(this.position), JSON.stringify(this.metadata)]
    );
    if (charDataResult.affectedRows === 0) {
      characterLogger.warn(`Failed to save character data ${this.citizenid} | ${this.name}(${this.serverId})`);
      return;
    }

    const charInfoResult = await SQL.query(
      `
      INSERT INTO character_info (citizenid, firstname, lastname, birthdate, gender, nationality, phone, cash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE firstname = VALUES(firstname),
                              lastname = VALUES(lastname),
                              birthdate = VALUES(birthdate),
                              gender = VALUES(gender),
                              nationality = VALUES(nationality),
                              phone = VALUES(phone),
                              cash = VALUES(cash),
                              last_updated = NOW()
    `,
      [
        this.citizenid,
        this.charinfo.firstname,
        this.charinfo.lastname,
        this.charinfo.birthdate,
        this.charinfo.gender,
        this.charinfo.nationality,
        this.charinfo.phone,
        this.charinfo.cash,
      ]
    );
    if (charInfoResult.affectedRows === 0) {
      characterLogger.warn(`Failed to save character info ${this.citizenid} | ${this.name}(${this.serverId})`);
      return;
    }
    characterLogger.info(`Saved character ${this.citizenid} | ${this.name}(${this.serverId})`);
  };

  updateMetadata = <T extends keyof Core.Characters.Metadata>(key: T, value: Core.Characters.Metadata[T]) => {
    this.metadata[key] = value;
    if (this.serverId) {
      emitNet('core:characters:metadata:update', this.serverId, key, value);
    }
  };

  static build = async (citizenid: number, overwriteChardata?: Omit<Core.Characters.Charinfo, 'cash' | 'phone'>) => {
    const dbData = await SQL.scalar('SELECT * FROM all_character_data WHERE citizenid = ?', [citizenid]);
    if (!dbData || Object.keys(dbData).length === 0) {
      mainLogger.warn(`Failed to load player: ${citizenid}`);
      return;
    }

    const charinfo = {} as Core.Characters.Charinfo;
    for (const key of Object.keys(defaultCharinfo) as (keyof Core.Characters.Charinfo)[]) {
      if (key === 'phone') {
        charinfo.phone = dbData.phone ?? (await generatePhone());
        continue;
      }

      if (overwriteChardata && key in overwriteChardata) {
        //@ts-ignore
        charinfo[key] = overwriteChardata[key];
        continue;
      }

      //@ts-ignore
      charinfo[key] = dbData[key] ?? defaultCharinfo[key];
    }

    const metadata: Core.Characters.Metadata = !dbData.metadata
      ? { ...defaultMetadata, dna: await generateDNA() }
      : (JSON.parse(dbData.metadata) as Core.Characters.Metadata);

    const position: Vec3 = !dbData.position ? { x: 0, y: 0, z: 0 } : JSON.parse(dbData.position);

    const ply = new Player(citizenid, dbData.steamid, charinfo, metadata, position);

    return ply;
  };
}
