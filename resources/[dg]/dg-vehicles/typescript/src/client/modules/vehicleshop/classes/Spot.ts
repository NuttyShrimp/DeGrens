import { Events, Notifications, Peek, PolyZone, RPC, UI, Util, Vehicles } from '@dgx/client';

import { requestTestDrive } from '../services/testdrive.vehicleshop';
import { spawnLocalVehicle } from '@helpers/vehicle';

export class Spot {
  public readonly id: number;
  private readonly position: Vec3;
  private readonly heading: number;
  private _model: string;
  private vehicle?: number;

  private vehiclePeekIds: string[] = [];

  constructor(id: number, data: VehicleShop.Spot) {
    this.id = id;
    this.position = { x: data.position.x, y: data.position.y, z: data.position.z };
    this.heading = data.position.w;
    this._model = data.model;
    this.buildZone();
    this.spawnVehicle();
  }

  public get model() {
    return this._model;
  }
  private set model(value: typeof this._model) {
    this._model = value;
  }

  private log = (msg: string) => {
    console.log(`[VehicleShop] ${msg}`);
  };

  private buildZone = () => {
    PolyZone.addBoxZone(
      'pdm_spot',
      this.position,
      8,
      4,
      {
        minZ: this.position.z - 2,
        maxZ: this.position.z + 3,
        heading: this.heading,
        data: {
          id: this.id,
        },
      },
      true
    );
  };

  public changeModel = (newModel: string) => {
    this.model = newModel;
    this.despawnVehicle();
    this.spawnVehicle();
  };

  private spawnVehicle = async () => {
    // cache the model, if model does not load cant get correct model from spot because might already be changed
    const modelToSpawn = this.model;
    if (this.vehicle) {
      this.log(`Tried to spawn vehicle at spot ${this.id} but a vehicle was already present`);
      this.despawnVehicle();
    }

    this.vehicle = await spawnLocalVehicle({
      model: modelToSpawn,
      position: { w: this.heading, ...this.position },
      plate: `PDMSPOT${this.id + 1}`,
      doorLockState: 3,
      invincible: true,
      frozen: true,
      validateAfterModelLoad: () => {
        return this.model === modelToSpawn;
      },
    });
    if (!this.vehicle) {
      this.log(`Failed to spawn vehicle at spot ${this.id}`);
      return;
    }

    this.vehiclePeekIds = Peek.addEntityEntry(this.vehicle, {
      options: [
        {
          label: 'Start Testrit',
          icon: 'fas fa-key',
          action: () => {
            requestTestDrive(this.model);
          },
        },
        {
          label: 'Koop Voertuig',
          icon: 'fas fa-money-bill',
          action: () => {
            this.buyVehicle();
          },
        },
        {
          label: 'Stel Beschikbaar',
          icon: 'fas fa-handshake',
          business: [{ name: 'pdm' }],
          action: () => {
            Events.emitNet('vehicles:shop:allowPlayerToBuy', this.id, this.model);
          },
        },
      ],
      distance: 2.0,
    });
  };

  public despawnVehicle = () => {
    if (!this.vehicle || !DoesEntityExist(this.vehicle)) {
      this.vehicle = undefined;
      this.log(`Tried to despawn vehicle at spot ${this.id} but no vehicle was present`);
      return;
    }
    SetEntityAsMissionEntity(this.vehicle, true, true);
    if (!NetworkGetEntityIsNetworked(this.vehicle) && IsEntityAVehicle(this.vehicle)) {
      DeleteEntity(this.vehicle);
    } else {
      console.error(`[VehicleShop] Tried to delete vehicle at spot ${this.id} but targetting wrong entity`);
    }
    this.vehicle = undefined;
    Peek.removeEntityEntry(this.vehiclePeekIds);
    this.vehiclePeekIds = [];
  };

  private buyVehicle = async () => {
    const canBuy = await RPC.execute<boolean>('vehicles:shop:canPlayerBuy', this.id, this.model);
    if (!canBuy) {
      Notifications.add('Je hebt een werknemer nodig om dit voertuig te kopen', 'error');
      return;
    }

    const stock = await RPC.execute<number>('vehicles:info:getModelstock', this.model);
    if ((stock ?? 0) <= 0) {
      Notifications.add('Dit voertuig is niet op stock!', 'error');
      return;
    }

    Events.emitNet('vehicles:shop:buyVehicle', this.id, this.model);
  };
}
