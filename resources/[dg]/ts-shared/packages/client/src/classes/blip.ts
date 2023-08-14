import { Util } from './index';

const getLocalEntity = (type: NBlip.Type, id: number) => {
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
  private handle: number | null;
  private settings: NBlip.Settings;
  private mode: NBlip.Mode;
  private coords: Vec3;

  constructor(type: NBlip.Type, id: number, settings: NBlip.Settings, startCoords: Vec3) {
    this.id = id;
    this.type = type;
    this.handle = null;
    this.settings = settings;
    this.mode = 'coords'; // start as coords, updatecoords will handle changing to entity if local exists

    const entity = getLocalEntity(this.type, this.id);
    const entityExists = entity && DoesEntityExist(entity);
    this.coords = entityExists ? Util.getEntityCoords(entity) : startCoords;

    this.checkMode();
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
      const text = typeof this.settings.text === 'function' ? this.settings.text() : this.settings.text;
      BeginTextCommandSetBlipName('STRING');
      AddTextComponentString(text);
      EndTextCommandSetBlipName(this.handle);
    }

    SetBlipAsShortRange(this.handle, this.settings.shortRange ?? true);
  }

  public checkMode() {
    const existLocally = this.doesEntityExistsLocally();

    // if current mode is entity but entity does not exist, switch to coord
    if (this.mode === 'entity') {
      if (!existLocally) {
        this.mode = 'coords';
        this.updateBlip();
      }
      return;
    }

    // if current mode is coords but entity does exist, switch to entity
    if (existLocally) {
      this.mode = 'entity';
      this.updateBlip();
    } else {
      // if mode is coords, update coord if blip exists, else change to coord to add blip
      if (this.handle && DoesBlipExist(this.handle)) {
        SetBlipCoords(this.handle, this.coords.x, this.coords.y, this.coords.z);
      } else {
        this.mode = 'coords';
        this.updateBlip();
      }
    }
  }

  private updateBlip() {
    if (this.handle && DoesBlipExist(this.handle)) {
      RemoveBlip(this.handle);
    }

    if (this.mode === 'coords') {
      this.handle = AddBlipForCoord(this.coords.x, this.coords.y, this.coords.z);
    } else if (this.mode === 'entity') {
      const entity = getLocalEntity(this.type, this.id);
      if (entity && DoesEntityExist(entity)) {
        this.handle = AddBlipForEntity(entity);
      }
    }

    this.applySettings();
  }

  private doesEntityExistsLocally = () => DoesEntityExist(getLocalEntity(this.type, this.id));

  public destroy() {
    if (!this.handle || !DoesBlipExist(this.handle)) return;

    RemoveBlip(this.handle!);
    this.handle = null;
  }

  public updateCoords(coords: Vec3) {
    this.coords = coords;
    this.checkMode();
  }

  public changeSprite(sprite: number) {
    this.settings.sprite = sprite;

    if (this.handle && DoesBlipExist(this.handle)) {
      SetBlipSprite(this.handle, sprite);
    }
  }

  public saveCoords() {
    if (!this.handle || !DoesBlipExist(this.handle)) return;

    const [x, y, z] = GetBlipCoords(this.handle);
    this.coords = { x, y, z };
  }
}
