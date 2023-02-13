interface Server {
  Shared: Shared;
  Players: Player[];
  Commands: Commands;
  UseableItems: UseableItem[];
  Config: Config;
  Functions: ServerFunctions;
  Player: PlayerFunctions;
  ServerCallbacks: {
    [key: string]: (...args: any[]) => void;
  };

  cidToPlyId: Record<number, number>;

  /**
   * Prints a table in a formatted string in the server console
   */
  Debug(obj: object | Array<unknown>, indent?: number): void;

  /**
   * Prints a formatted error message in the server console with the resource it came from
   */
  ShowError(resource: string, msg: string): void;

  /**
   * Prints a formatted success log in the server console with the resource it came from
   */
  ShowSuccess(resource: string, msg: string): void;
}

interface ServerFunctions {
  /**
   * Server side function for fetching an entity's world position
   */
  GetEntityCoords(entity: number): Vector;

  /**
   * @returns player's identifier of specified type or null if not found
   */
  GetIdentifier(source: number, type: string): string | null;

  /**
   * @returns player source from a given identifier or null if not found
   */
  GetSource(identifier: string): number | null;

  /**
   * @param source: Either player's source or also accepts an identifier using QBCore.Functions.GetSource internally
   * @returns Player object
   */
  GetPlayer(source: number | string): Player;

  /**
   * @param citizenid: Player's citizenid
   * @returns Player object
   */
  GetPlayerByCitizenId(citizenid: number): Player;

  /**
   * @param citizenid: Player's citizenid
   * @returns server id
   */
  getPlyIdForCid(citizenid: number): number | undefined;

  /**
   * @param number: Character's Phone Number
   * @returns Player object
   */
  GetPlayerByPhone(number: string): Player;

  /**
   * @returns Array of all logged in players, ignores players with 'logged-out' state
   */
  GetPlayers(): number[];

  /** If player with server id 1 is online and all other player IDs are in order without gaps, this object is serialised as an array
   *  otherwise it will be serialised as an object where the key is the server ID and the value is the player object.
   *  You **should** however treat this as an object.
   * @returns Object or Array of players
   */
  GetQBPlayers(): PlayersObject | Player[];

  /**
   * Get the playerobject tied to the given citizenid from the database without the functions.
   * If a player is online it does use the existing player object.
   * @param citizenid: Player's citizenid
   */
  GetOfflinePlayerByCitizenId(citizenid: number): Promise<Pick<Player, 'PlayerData'>>;

  /**
   * Get the playerobject tied to the given phone from the database without the functions.
   * If a player is online it does use the existing player object.
   * @param phoneNumber: Player's phone number
   */
  GetOfflinePlayerByPhone(phoneNumber: number): Promise<Pick<Player, 'PlayerData'>>;

  /**
    * Fetch all the citizenid's tied to this steamId
    */
  GetCidsForSteamId(steamId: string): number[];

  /**
   * Registers a new server callback, use QBCore.Functions.TriggerCallback on the client side to trigger the callback
   */
  CreateCallback(name: string, cb: (source: number, cb: Function, ...args: any[]) => void): void;

  /**
   * Triggers a server callback
   */
  TriggerCallback(name: string, source: number, cb: Function, ...args: any[]): void;

  /**
   * Used internally on connection, use DropPlayer instead
   */
  Kick(source: number, reason: string, setKickReason: Function, deferrals: any): void;

  /** Only use when QBCore.Config.Whitelist is set to true
   * @returns true if the player is whitelisted
   */
  IsWhitelisted(source: number): boolean;

  /**
   * Sets the player's admin privileges to the specified level, updates permission list and database
   */
  AddPermission(source: number, permission: number): void;

  /**
   * Sets the player's permission level to 'user', deletes from database
   */
  RemovePermission(source: number): void;

  /**
   * @returns true if the user has the specified permission
   */
  HasPermission(source: number, permission: string): boolean;

  /**
   * @returns true if there is already a player online with this license
   */
  IsLicenseInUse(license: string): boolean;

  /**
   * @returns a vehicle entity or 0 of no networked vehicle was found
   */
  GetClosestVehicle(src: number): number;
}

// Global player functions
interface PlayerFunctions {
  /**
   * Internal function, constructor to player class
   */
  CreatePlayer(): Player;

  /**
   * Saves the player to the database
   */
  Save(source: number): void;

  /**
   * Gives the player 'logged out' status, e.g. the state they have before and during character selection
   */
  Logout(source: number): void;

  /**
   * Deletes a player's character from the database
   */
  DeleteCharacter(source: number, citizenid: number): void;

  /**
   * Internal function, fetches from database and parses saved inventory data during character loading
   */
  LoadInventory(PlayerData: PlayerData): PlayerData;

  /**
   * Saves the player's currently active character's inventory to the database
   */
  SaveInventory(source: number): void;

  /**
   * Internal function, generates a new unique phonenumber for a new character
   */
  CreatePhoneNumber(): string;
}

interface Player {
  PlayerData: PlayerData;
  Functions: SelfFunctions;
}

interface PlayersObject {
  [key: number]: Player;
}

// Functions that the player object can call on itself
interface SelfFunctions {
  /**
   * Refreshes the player's playerdata, if second argument is true it refreshes commands
   */
  UpdatePlayerData(dontUpdateChat: boolean): void;

  /**
   * Sets the specified metadata key to the specified value
   */
  SetMetaData<T extends keyof MetaData>(meta: T, value: MetaData[T]): void;

  /**
   * Sets the cash in the charinfo object
   */
  setCash(cash: number): void;

  /**
   * Saves the player to the database, shorthand for QBCore.Player.Save(self.PlayerData.source)
   */
  Save(): void;
}

interface Commands {
  /**
   *  Refreshes commands for specified player
   */
  Refresh(source: number): void;

  /**
   * Adds a new command
   * @param name: The name of the command
   * @param help: Help text for the command
   * @param arguments: Declare expected arguments and provide help text for each argument
   * @param argsrequire: If true the user must enter all arguments
   * @param callback: Callback function to run when the command is executed, passes params source, args
   * @param permission: Permission level required to execute the command
   */
  Add(
    name: string,
    help: string,
    arguments: CommandHelp[],
    argsrequire: boolean,
    callback: (source: number, args: any) => void,
    permission: string
  ): void;

  List: Command[];
}

interface Command {
  [key: string]: {
    permission: string;
    arguments: CommandHelp;
    name: string;
    help: string;
    argsrequired: boolean;
    callback: Function;
  };
}

interface CommandHelp {
  name: string;
  help: string;
}

interface UseableItem {
  [key: string]: Function;
}
