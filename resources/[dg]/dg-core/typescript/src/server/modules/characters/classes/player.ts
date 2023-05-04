import { SQL, Util } from '@dgx/server';
import { Vector3 } from '@dgx/shared';
import { getModule } from 'moduleController';
import { characterLogger } from '../logger.character';
import { defaultMetadata, generateDNA, generatePhone } from '../helpers.character';
import { mainLogger } from 'sv_logger';

export class Player {
  name: string;
  steamId: string;
  serverId?: number;
  citizenid: number;
  charinfo: Core.Characters.Charinfo;
  position: Vec3;
  metadata: Core.Characters.Metadata;
  private loaded = false;

  constructor(cid: number) {
    this.citizenid = cid;
    this.name = '';
    this.steamId = '';
    this.charinfo = {
      firstname: 'John',
      lastname: 'Doe',
      birthdate: '1990-01-01',
      nationality: 'Belg',
      gender: 0,
      cash: 500,
      phone: '0123456789',
    };
    this.position = new Vector3(0, 0, 0);
    this.metadata = { ...defaultMetadata };
    this.initiate();
  }

  private async validateMetadata() {
    for (let key in defaultMetadata) {
      if (this.metadata?.[key as keyof Core.Characters.Metadata] === undefined) {
        if (key === 'dna') {
          this.metadata.dna = await generateDNA();
          return;
        }
        // @ts-ignore TS being a bitch
        this.metadata[key] = defaultMetadata[key];
      }
    }
  }

  private async initiate() {
    const dbData = await SQL.scalar('SELECT * FROM all_character_data WHERE citizenid = ?', [this.citizenid]);
    if (!dbData) {
      mainLogger.warn(`Failed to load player: ${this.citizenid}`);
      return;
    }
    if (!dbData.metadata) {
      this.charinfo.phone = await generatePhone();
      this.metadata.dna = await generateDNA();
      return;
    }
    this.steamId = dbData.steamid;
    this.charinfo.firstname = dbData.firstname;
    this.charinfo.lastname = dbData.lastname;
    this.charinfo.birthdate = dbData.birthdate;
    this.charinfo.nationality = dbData.nationality;
    this.charinfo.gender = dbData.gender;
    this.charinfo.cash = dbData.cash;
    this.charinfo.phone = dbData.phone;

    this.position = JSON.parse(dbData.position);
    this.metadata = JSON.parse(dbData.metadata) as Core.Characters.Metadata;
    this.loaded = true;
    this.validateMetadata();
  }

  isLoaded = () => this.loaded;

  linkUser = (src: number) => {
    this.serverId = src;
    this.name = GetPlayerName(String(src));
  };

  save = async () => {
    if (!this.serverId) {
      return;
    }
    const ped = GetPlayerPed(String(this.serverId));
    if (ped) {
      this.updateMetadata('health', Math.max(GetEntityHealth(ped), 100));
      this.updateMetadata('armor', GetPedArmour(ped));
      this.position = Util.getPlyCoords(this.serverId);
    }

    const userModule = getModule('users');
    await userModule.saveUser(this.serverId);

    const charResult = await SQL.query(
      `
      INSERT INTO characters (citizenid, steamid, last_updated) VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE last_updated = NOW()
    `,
      [this.citizenid, userModule.getPlyIdentifiers(this.serverId).steam]
    );
    if (charResult.affectedRows === 0) {
      characterLogger.warn(`Failed to save character for ${this.name}(${this.serverId})`);
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
      characterLogger.warn(`Failed to save character data for ${this.name}(${this.serverId})`);
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
      characterLogger.warn(`Failed to save character info for ${this.name}(${this.serverId})`);
      return;
    }
    characterLogger.info(`Saved character for ${this.name}(${this.serverId})`);
  };

  updateMetadata = <T extends keyof Core.Characters.Metadata>(key: T, value: Core.Characters.Metadata[T]) => {
    this.metadata[key] = value;
    emitNet('core:characters:metadata:update', this.serverId, key, value);
  };
}
