const getLocalEntity = (pType: string, pNetId: number) => {
  let entity;
  if (pType === 'player') {
    const playerIndex = GetPlayerFromServerId(pNetId);
    entity = playerIndex !== -1 ? GetPlayerPed(playerIndex) : 0;
  } else {
    entity = NetworkGetEntityFromNetworkId(pNetId);
  }
  return entity;
}

export class EntityBlip {
  private id: number;
  private type: string;
  private enabled: boolean = false;
  private handle: number | null = null;
  private settings: NBlip.Settings;
  mode: 'coords' | 'entity' | null = null;

  constructor(pType: string, pNetId: number, pSettings: NBlip.Settings) {
    this.id = pNetId;
    this.type = pType;
    this.settings = pSettings;
  }

  private applySettings() {
    if(!this.handle) return;

    if (this.settings.sprite !== undefined) {
      SetBlipSprite(this.handle, this.settings.sprite);
    }
    if (this.settings.color !== undefined) {
      SetBlipColour(this.handle, this.settings.color);
    }
    if (this.settings.scale !== undefined) {
      SetBlipScale(this.handle, this.settings.scale);
    }
    if (this.settings.heading !== undefined) {
      SetBlipDisplayIndicatorOnBlip(this.handle, this.settings.heading);
    }
    if (this.settings.category !== undefined) {
      SetBlipCategory(this.handle, this.settings.category);
    }
    if (this.settings.text !== undefined) {
        BeginTextCommandSetBlipName("STRING")
        AddTextComponentString(this.settings.text)
        EndTextCommandSetBlipName(this.handle)
    }
  }

  changeMode(mode: 'entity'|'coords') {
    if (mode === this.mode || !this.enabled) return;

    if (this.handle && DoesBlipExist(this.handle)) {
      RemoveBlip(this.handle);
    }
    
    if (mode === 'coords') {
      // This needs some refactoring if we want to support 
      // other shit then players
      const coords = global.exports['dg-sync'].getPlayerCoords(this.id) as Vec3;

      if (coords) {
        this.mode = 'coords';
        this.handle = AddBlipForCoord(coords.x, coords.y, coords.z)
      }
    } else if (mode === 'entity') {
      const entity = getLocalEntity(this.type, this.id);
      
      if (entity) {
        this.handle = AddBlipForEntity(entity);
        this.mode = 'entity';
      }
    }

    this.applySettings();
  }

  updateCoords(coords: Vec3) {
    if (this.mode !== 'coords' || !this.enabled || !this.handle) return;
    SetBlipCoords(this.handle, coords.x, coords.y, coords.z);
  }

  doesEntityExistsLocally() {
    return DoesEntityExist(getLocalEntity(this.type, this.id));
  }

  enable() {
    if (this.enabled) return;
    this.enabled = true;

    const entity = getLocalEntity(this.type, this.id);
    const mode = DoesEntityExist(entity) ? "entity" : 'coords';

    this.changeMode(mode);
  }

  disable() {
    if (!this.enabled) return;
    this.enabled = false;
    
    if (this.handle && DoesBlipExist(this.handle)) {
      RemoveBlip(this.handle);
    }
  }
}
