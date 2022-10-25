import { Util } from '@dgx/client';

export class Npc {
  private _data: NpcData;
  private _entity: number;
  private _enabled: boolean;

  // #region Getters/Setters
  get data() {
    return this._data;
  }
  private set data(value: NpcData) {
    this._data = value;
  }
  get entity() {
    return this._entity;
  }
  private set entity(value: number) {
    this._entity = value;
  }
  get enabled() {
    return this._enabled;
  }
  set enabled(value: boolean) {
    this._enabled = value;
  }
  // #endregion

  constructor(npcData: NpcData) {
    this.data = npcData;
    if (typeof this.data.model === 'string') {
      this.data.model = GetHashKey(this.data.model);
    }

    this.entity = null;
    this.enabled = true;

    if (this.data.blip) {
      const blip = AddBlipForCoord(this.data.position.x, this.data.position.y, this.data.position.z);
      SetBlipSprite(blip, this.data.blip.sprite);
      SetBlipColour(blip, this.data.blip.color);
      SetBlipDisplay(blip, 2);
      SetBlipScale(blip, this.data.blip.scale ?? 0.8);
      SetBlipAsShortRange(blip, true);
      BeginTextCommandSetBlipName('STRING');
      AddTextComponentString(this.data.blip.title);
      EndTextCommandSetBlipName(blip);
    }
  }

  async spawn() {
    if (this.entity) {
      throw new Error(`[NPCS] Tried to spawn already existing ped`);
    }

    await Util.loadModel(this.data.model);
    this.entity = CreatePed(
      4,
      this.data.model,
      this.data.position.x,
      this.data.position.y,
      this.data.position.z,
      this.data.heading,
      false,
      false
    );
    SetEntityCoordsNoOffset(
      this.entity,
      this.data.position.x,
      this.data.position.y,
      this.data.position.z,
      false,
      false,
      false
    );
    SetEntityAlpha(this.entity, 0, false);
    SetPedDefaultComponentVariation(this.entity);
    await Util.doesEntityExist(this.entity);

    this.data.flags.forEach(flag => {
      Entity(this.entity).state[flag.name] = flag.active;
    });

    this.data.settings.forEach(setting => {
      this.setSetting(setting);
    });

    if (this.data.scenario) {
      TaskStartScenarioInPlace(this.entity, this.data.scenario, 0, true);
    }

    if (this.data.clothing) {
      // TODO: clothing for peds for whoever the fuck wants this???
    }

    const alphaThread = setInterval(() => {
      const currentAlpha = GetEntityAlpha(this.entity);
      if (currentAlpha === 255) {
        clearInterval(alphaThread);
        return;
      }
      SetEntityAlpha(this.entity, currentAlpha + 51, false); // alpha changes only happen every 51
    }, 75);
  }

  private setSetting(setting: Settings.Setting) {
    switch (setting.type) {
      case 'invincible':
        SetEntityInvincible(this.entity, setting.active);
        break;
      case 'freeze':
        FreezeEntityPosition(this.entity, setting.active);
        break;
      case 'ignore':
        SetBlockingOfNonTemporaryEvents(this.entity, setting.active);
        break;
      case 'collision':
        SetEntityCompletelyDisableCollision(this.entity, setting.active, setting.active);
    }
  }

  delete() {
    if (!this.entity || !DoesEntityExist(this.entity)) return;
    const alphaThread = setInterval(() => {
      const currentAlpha = GetEntityAlpha(this.entity);
      if (currentAlpha === 0) {
        clearInterval(alphaThread);
        DeleteEntity(this.entity);
        this.entity = null;
        return;
      }
      SetEntityAlpha(this.entity, currentAlpha - 51, false); // alpha changes only happen every 51
    }, 75);
  }
}
