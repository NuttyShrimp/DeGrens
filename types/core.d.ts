declare namespace Core {
  namespace Users {
    type UserData = {
      serverId: number;
      steamId: string;
      name: string;
    };
  }

  namespace Characters {
    type Metadata = {
      cash: number;
      health: number;
      armor: number;
      stress: number;
      callsign: string;
      inside: {
        house?: string;
        apartment: {
          id?: number;
        };
      };
      dna: string;
      jailMonths: number;
      downState: 'alive' | 'unconscious' | 'dead';
      needs: {
        hunger: number;
        thirst: number;
      };
      walkStyle?: string;
    };

    type Charinfo = {
      firstname: string;
      lastname: string;
      birthdate: string;
      gender: number;
      nationality: string;
      phone: string;
      cash: number;
    };

    type Player = {
      name: string;
      steamId: string;
      serverId?: number;
      citizenid: number;
      charinfo: Charinfo;
      position: Vec3;
      metadata: Metadata;
      linkUser: (src: number) => void;
      save: () => Promise<void>;
      updateMetadata: <T extends keyof Metadata>(key: T, value: Metadata[T]) => void;
    };

    type PlayerData = {
      citizenid: number;
      charinfo: Charinfo;
      metadata: Metadata;
    };
  }

  namespace ClientModules {
    type List = {
      characters: CharacterModule;
    };
    type CharacterModule = {
      getMetadata: () => Characters.Metadata | null;
      getCharinfo: () => Characters.Charinfo | null;
      getPlayerData: () => Characters.PlayerData | null;
    };
  }

  namespace ServerModules {
    type List = {
      users: UserModule;
      characters: CharacterModule;
    };
    type UserModule = {
      getPlyIdentifiers: (src: number) => Record<string, string>;
      getServerIdFromIdentifier: (key: string, identifier: string) => number | undefined;
      saveUser: (src: number) => Promise<void>;
    };
    type CharacterModule = {
      selectCharacter: (src: number, cid: number) => Promise<boolean>;
      logout: (src: number) => Promise<void>;
      getAllPlayers: () => Record<number, Characters.Player>;
      loadPlayer: (src: number) => void;
      createCharacter: (src: number, charData: Omit<Core.Characters.Charinfo, 'cash' | 'phone'>) => Promise<boolean>;
      getPlayer: (src: number) => Characters.Player | undefined;
      getPlayerByCitizenId: (cid: number) => Characters.Player | undefined;
      getPlayerByPhone: (phone: string) => Characters.Player | undefined;
      getPlayerBySteamId: (steamId: string) => Characters.Player | undefined;
      getOfflinePlayer: (cid: number) => Promise<Characters.Player | undefined>;
      getServerIdFromCitizenId: (cid: number) => number | undefined;
      getCitizenIdsFromSteamId: (steamid: string) => number[];
    };
  }
}
