import { Vector3 } from '../../shared';
import { Sync, Util } from './index';

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
  private mode: NBlip.Mode | null;
  private blipLocation: Vec3 = { x:0, y:0, z:0 };
  private locationInterval: NodeJS.Timer | null;

  constructor(type: NBlip.Type, id: number, settings: NBlip.Settings) {
    this.id = id;
    this.type = type;
    this.handle = null;
    this.settings = settings;
    this.mode = null;
    this.locationInterval = null;

    const mode: NBlip.Mode = this.doesEntityExistsLocally() ? 'entity' : 'coords';
    this.changeMode(mode);
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

  private changeMode(mode: NBlip.Mode) {
    if (this.mode === mode) return;
    if (this.locationInterval) {
      clearInterval(this.locationInterval);
      this.locationInterval = null;
    }

    if (this.handle && DoesBlipExist(this.handle)) {
      RemoveBlip(this.handle);
    }

    if (mode === 'coords') {
      let coords = Sync.getPlayerCoords(this.id);

      if (!coords) {
        coords = this.blipLocation;
      }

      this.mode = 'coords';
      this.handle = AddBlipForCoord(coords.x, coords.y, coords.z);
    } else if (mode === 'entity') {
      const entity = getLocalEntity(this.type, this.id);

      if (entity && DoesEntityExist(entity)) {
        this.mode = 'entity';
        this.handle = AddBlipForEntity(entity);
        this.blipLocation = Util.ArrayToVector3(GetBlipCoords(this.handle))
        this.locationInterval = setInterval(() => {
          if (this.handle && DoesBlipExist(this.handle)) {
            this.blipLocation = Util.ArrayToVector3(GetBlipCoords(this.handle))
          }
        }, 1000)
      }
    }

    this.applySettings();
  }

  private doesEntityExistsLocally = () => {
    return DoesEntityExist(getLocalEntity(this.type, this.id));
  };

  public destroy() {
    if (this.handle && DoesBlipExist(this.handle)) {
      RemoveBlip(this.handle);
      this.handle = null;
    }
  }

  public updateCoords(coords: Vec3) {
    const existLocally = this.doesEntityExistsLocally();
    if (this.mode === 'entity') {
      if (!existLocally) {
        this.changeMode('coords');
      }
    } else {
      if (existLocally) {
        this.changeMode('entity');
      } else {
        if (this.handle) {
          SetBlipCoords(this.handle, coords.x, coords.y, coords.z);
        }
      }
    }
  }

  public changeSprite(sprite: number) {
    this.settings.sprite = sprite;
    if (this.handle) {
      SetBlipSprite(this.handle, sprite);
    }
  }
}