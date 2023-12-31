import { Keys, Peek, PolyTarget, PolyZone, Sync, Util, Weather } from '@dgx/client';
import { Vector3 } from '@dgx/shared';

import { Plans } from '../data/plans';
import { FloatTilSafe, getGeneratorFromRoom, setCorrectZ } from '../helpers/util';

export class Room {
  plan: Buildplan;
  planName: string;
  position: number | Vec3;
  cachedObjects: number[] = [];
  buildingObj: number = 0;
  startingPos: Vector3 | null = null;
  roomOrigin: Vector3 = Vector3.create(0);
  peekZoneIds: string[] = [];
  peekIds: Record<Peek.EntryType, string[]> = {
    model: [],
    entity: [],
    bones: [],
    flags: [],
    global: [],
  };
  keyHandlers: Map<string, number[]> = new Map();
  // Array with all tracked zones where the player is currently in
  activeZones: string[] = [];
  dryVolHandle: number | null = null;

  constructor(planName: string, roomPos: number | Vec3) {
    this.plan = Plans[planName];
    this.planName = planName;
    this.position = roomPos;
  }

  private Area(): void {
    if (!this.roomOrigin) return;
    const ped = PlayerPedId();
    let handle = 0;
    let foundObj = 0;
    [handle, foundObj] = FindFirstObject(0);
    let success = true;
    while (success) {
      const pos = Util.getEntityCoords(foundObj);
      const distance = this.roomOrigin.distance(pos);
      if (distance < 50 && foundObj != ped) {
        if (IsEntityAPed(foundObj)) {
          if (!IsPedAPlayer(foundObj)) {
            DeleteEntity(foundObj);
          }
        } else if (!IsEntityAVehicle(foundObj) && !IsEntityAttached(foundObj)) {
          DeleteEntity(foundObj);
        }
      }
      [success, foundObj] = FindNextObject(handle);
    }
    EndFindObject(handle);
  }

  private Peds(): void {
    if (!this.roomOrigin) return;
    const ped = PlayerPedId();
    let handle = 0;
    let foundObj = 0;
    [handle, foundObj] = FindFirstPed(0);
    let success = true;
    while (success) {
      const pos = Util.getEntityCoords(foundObj);
      const distance = this.roomOrigin.distance(pos);
      if (distance < 50 && foundObj != ped) {
        if (!IsPedAPlayer(foundObj) && !IsEntityAVehicle(foundObj)) {
          DeleteEntity(foundObj);
        }
      }
      [success, foundObj] = FindNextPed(handle);
    }
    EndFindPed(handle);
  }

  private createInteractions(): void {
    if (!this.plan.interactZone) return;
    this.plan.interactZone.forEach(i => {
      let label = '';

      (
        ['GeneralUse', 'housingMain', 'housingSecondary'] as (keyof Omit<InteractionZone, 'dist' | 'offset' | 'name'>)[]
      ).forEach(key => {
        if (!i[key]) return;
        if (!this.keyHandlers.has(key)) {
          this.keyHandlers.set(key, []);
        }
        label += `[${Keys.getBindedKey(`+${key}`)}] - ${i[key]!.label} | `;
        this.keyHandlers.get(key)!.push(
          Keys.onPressDown(key, () => {
            if (!i[key] || this.activeZones.findIndex(z => z === i.name) === -1) return;
            if (i[key]!.isServer) {
              emitNet(i[key]!.event);
              return;
            }
            emit(i[key]!.event);
          })
        );
      });
      label = label.replace(/( \| ?)$/, '');

      PolyZone.addCircleZone(`${this.planName}_interact_${i.name}`, this.roomOrigin.add(i.offset), i.dist, {
        data: {
          label,
          name: i.name,
        },
        routingBucket: Sync.getCurrentRoutingBucket(),
        useZ: true,
      });
      PolyZone.onEnter(`${this.planName}_interact_${i.name}`, (zone, data) => {
        global.exports['dg-ui'].showInteraction(data.label);
        this.activeZones.push(data.name);
      });
      PolyZone.onLeave(`${this.planName}_interact_${i.name}`, () => {
        global.exports['dg-ui'].hideInteraction();
        this.activeZones = this.activeZones.filter(z => z !== i.name);
      });
    });
  }

  private removeInteractions(): void {
    if (!this.plan.interactZone) return;
    this.plan.interactZone.forEach(i => {
      PolyZone.removeZone(`${this.planName}_interact_${i.name}`);
    });
  }

  private createPeekZones(): void {
    if (!this.plan.targetZone) return;
    this.plan.targetZone.forEach((i, idx) => {
      const zoneName = `${this.planName}_peekInteraction_${idx}`;
      const options = {
        ...i.options,
        routingBucket: Sync.getCurrentRoutingBucket(),
      };
      if ('radius' in i) {
        // Circle targetZone
        PolyTarget.addCircleZone(zoneName, this.roomOrigin.add(i.offset), i.radius, options, true);
      } else {
        const boxOptions = {
          ...options,
          minZ: i.options.minZ! + this.roomOrigin.z,
          maxZ: i.options.maxZ! + this.roomOrigin.z,
        };
        // Box targetZone
        PolyTarget.addBoxZone(zoneName, this.roomOrigin.add(i.offset), i.width, i.length, boxOptions, true);
      }
      this.peekZoneIds.push(
        ...Peek.addZoneEntry(
          zoneName,
          {
            distance: i.entries.distance,
            options: i.entries.options,
          },
          true
        )
      );
    });
  }

  private removePeekZones(): void {
    if (!this.plan.targetZone) return;
    this.plan.targetZone.forEach((i, idx) => {
      const zoneName = `${this.planName}_peekInteraction_${idx}`;
      PolyTarget.removeZone(zoneName);
      this.peekZoneIds.forEach(id => Peek.removeZoneEntry(id));
    });
  }

  private createPeekEntries(): void {
    if (!this.plan.peek) return;
    this.plan.peek.forEach(i => {
      this.peekIds[i.type].push(
        ...global.exports['dg-peek'].addEntry(i.type, i.id, {
          distance: i.distance,
          options: i.options,
        })
      );
    });
  }

  private removePeekEntries(): void {
    Object.keys(this.peekIds).forEach(key => {
      // @ts-ignore
      global.exports['dg-peek'].removeEntry(key, this.peekIds[key]);
    });
  }

  private unregisterKeyHandler(): void {
    this.keyHandlers.forEach((ids, keyName) => {
      ids.forEach(id => Keys.removeHandler(keyName, id));
    });
  }

  private createDryVolume(volume: { min: ArrayVec3; max: ArrayVec3 }) {
    if (this.dryVolHandle) return;
    volume.min = Util.Vector3ToArray(Util.ArrayToVector3(volume.min).add(this.roomOrigin));
    volume.max = Util.Vector3ToArray(Util.ArrayToVector3(volume.max).add(this.roomOrigin));
    this.dryVolHandle = CreateDryVolume(...volume.min, ...volume.max);
  }

  private removeDryVolume() {
    if (!this.dryVolHandle) return;
    RemoveDryVolume(this.dryVolHandle);
    this.dryVolHandle = null;
  }

  async createRoom(): Promise<[Coords, number[]] | null> {
    try {
      const ped = PlayerPedId();
      this.startingPos = Util.ArrayToVector3(GetEntityCoords(ped, true));
      FreezeEntityPosition(ped, true);

      if (this.plan.origin) {
        SetEntityCoords(ped, this.plan.origin.x, this.plan.origin.y, this.plan.origin.z, true, false, false, false);
        await Util.Delay(1000);
      }

      const [ymapObjects, extents] = global.exports['dg-lib'].parse(this.planName, this.plan.saveToCache);
      let mainPos = new Vector3(0, 0, 0);
      let objectSpawnCoords: Vector3;

      switch (typeof this.position) {
        case 'number': {
          objectSpawnCoords = getGeneratorFromRoom(this.plan, this.position)!;
          break;
        }
        default: {
          objectSpawnCoords = new Vector3(this.position.x, this.position.y, this.position.z);
          break;
        }
      }
      this.roomOrigin = objectSpawnCoords;

      for (const v of ymapObjects) {
        if (v.name.toLowerCase() === this.plan.shell.toLowerCase()) {
          mainPos = new Vector3(v.x, v.y, v.z);
        }
      }
      // Set entity coords to spawnppoint
      SetEntityCoords(
        ped,
        objectSpawnCoords.x + this.plan.spawnOffset.x,
        objectSpawnCoords.y + this.plan.spawnOffset.y,
        objectSpawnCoords.z + this.plan.spawnOffset.z,
        true,
        false,
        false,
        false
      );
      SetEntityHeading(ped, this.plan.spawnOffset.w);

      this.Area();
      this.Peds();

      const buildingPos = objectSpawnCoords.add(mainPos);

      const buildingHash = GetHashKey(this.plan.shell);
      await Util.loadModel(this.plan.shell);
      this.buildingObj = CreateObject(buildingHash, buildingPos.x, buildingPos.y, buildingPos.z, false, false, false);
      setCorrectZ(this.buildingObj, objectSpawnCoords.z + mainPos.z);
      FreezeEntityPosition(this.buildingObj, true);

      for (const k in ymapObjects) {
        const v = ymapObjects[k];
        if (v.name == this.plan.shell) {
          SetEntityQuaternion(this.buildingObj, v.rx, v.ry, v.rz, v.rw * -1);
          continue;
        }
        const worldCoords = new Vector3(objectSpawnCoords.x + v.x, objectSpawnCoords.y + v.y, objectSpawnCoords.z);
        const intObj = CreateObject(
          GetHashKey(v.name),
          worldCoords.x,
          worldCoords.y,
          worldCoords.z,
          false,
          false,
          false
        );
        setCorrectZ(intObj, objectSpawnCoords.z + v.z);
        SetEntityQuaternion(intObj, v.rx, v.ry, v.rz, v.rw * -1);
        FreezeEntityPosition(intObj, true);
        this.cachedObjects.push(intObj);
      }

      const safe = await FloatTilSafe(this.plan.shell);

      FreezeEntityPosition(ped, false);
      TriggerEvent('build:event:inside', true);
      TriggerServerEvent('build:event:inside', true);
      Sync.setPlayerInvincible(false);

      Util.debug(`created: ${this.planName} | success: ${safe}`);
      if (safe) {
        Weather.freezeTime(true, 0);
        Weather.freezeWeather(true, 'CLEAR');
        this.createInteractions();
        this.createPeekZones();
        this.createPeekEntries();
        this.createDryVolume(extents);
        DoScreenFadeIn(250);
        return [objectSpawnCoords, this.cachedObjects];
      }
      this.exit();
      return null;
    } catch (e) {
      console.error(e);
      this.exit();
      return null;
    }
  }

  exit(overridePos?: Coords) {
    this.Area();
    this.Peds();

    this.removeInteractions();
    this.removePeekZones();
    this.removePeekEntries();
    this.removeDryVolume();
    this.unregisterKeyHandler();

    emit('build:event:inside', false);
    emitNet('build:event:inside', false);
    Weather.freezeTime(false);
    Weather.freezeWeather(false);
    if (overridePos) {
      SetEntityCoords(PlayerPedId(), overridePos.x, overridePos.y, overridePos.z, true, false, false, false);
      return;
    }
    if (this.startingPos) {
      SetEntityCoords(
        PlayerPedId(),
        this.startingPos.x,
        this.startingPos.y,
        this.startingPos.z,
        true,
        false,
        false,
        false
      );
      this.startingPos = null;
    }
    DoScreenFadeIn(250);
  }
}
