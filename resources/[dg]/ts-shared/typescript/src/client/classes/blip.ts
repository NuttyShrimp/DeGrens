import { Sync } from './index';

const getLocalEntity = (type: string, id: number) => {
  let entity: number;
  if (type === 'player') {
    const playerIndex = GetPlayerFromServerId(id);
    entity = playerIndex !== -1 ? GetPlayerPed(playerIndex) : 0;
  } else {
    entity = NetworkGetEntityFromNetworkId(id);
  }
  return entity;
};

export class EntityBlip {
  private id: number;
  private type: NBlip.Type;
  private enabled: boolean;
  private handle: number | null;
  private settings: NBlip.Settings;
  private mode: 'coords' | 'entity' | null;

  constructor(type: NBlip.Type, id: number, settings: NBlip.Settings) {
    this.id = id;
    this.type = type;
    this.enabled = false;
    this.handle = null;
    this.settings = settings;
    this.mode = null;
  }

  public getMode() {
    return this.mode;
  }

  private applySettings() {
    if (!this.handle) return;

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
      BeginTextCommandSetBlipName('STRING');
      AddTextComponentString(this.settings.text);
      EndTextCommandSetBlipName(this.handle);
    }
    if (this.settings.shortRange !== undefined) {
      SetBlipAsShortRange(this.handle, this.settings.shortRange);
    }
  }

  changeMode(mode: 'entity' | 'coords') {
    if (mode === this.mode || !this.enabled) return;

    if (this.handle && DoesBlipExist(this.handle)) {
      RemoveBlip(this.handle);
    }

    if (mode === 'coords') {
      const coords = Sync.getPlayerCoords(this.id);

      if (coords) {
        this.mode = 'coords';
        this.handle = AddBlipForCoord(coords.x, coords.y, coords.z);
      }
    } else if (mode === 'entity') {
      const entity = getLocalEntity(this.type, this.id);

      if (entity && DoesEntityExist(entity)) {
        this.mode = 'entity';
        this.handle = AddBlipForEntity(entity);
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

    const mode = this.doesEntityExistsLocally() ? 'entity' : 'coords';
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
