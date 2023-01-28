import { Events, Notifications, Peek, PolyZone, RPC, UI, Util } from '@dgx/client';

import { requestTestDrive } from '../services/testdrive.vehicleshop';

export class Spot {
  public readonly id: number;
  private readonly position: Vec3;
  private readonly heading: number;
  private _model: string;
  private needsEmployee: boolean;
  private vehicle?: number;

  private vehiclePeekIds: string[] = [];

  constructor(id: number, data: VehicleShop.Spot) {
    this.id = id;
    this.position = { x: data.position.x, y: data.position.y, z: data.position.z };
    this.heading = data.position.w;
    this._model = data.model;
    this.needsEmployee = data.needsEmployee;
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

  public changeModel = (newModel: string, needsEmployee: boolean) => {
    this.model = newModel;
    this.needsEmployee = needsEmployee;
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

    const hash = Util.getHash(modelToSpawn);
    await Util.loadModel(hash);
    if (!HasModelLoaded(hash)) {
      this.log(`Failed to load vehicle model ${modelToSpawn}`);
      return;
    }

    if (this.model !== modelToSpawn) {
      this.log('Spotvehicle has been changed while the previous model was loading');
      return;
    }

    this.vehicle = CreateVehicle(hash, this.position.x, this.position.y, this.position.z, this.heading, false, true);
    if (this.vehicle === 0) {
      this.log(`Failed to spawn vehicle at spot ${this.id}`);
      return;
    }
    SetModelAsNoLongerNeeded(hash);
    SetEntityInvincible(this.vehicle, true);
    FreezeEntityPosition(this.vehicle, true);
    SetVehicleDoorsLocked(this.vehicle, 3);
    SetVehicleNumberPlateText(this.vehicle, `PDMSPOT${this.id}`);

    this.vehiclePeekIds = Peek.addEntityEntry(
      this.vehicle,
      {
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
              this.allowPlayerToBuy();
            },
            canInteract: () => {
              return this.needsEmployee;
            },
          },
        ],
        distance: 2.0,
      },
      true
    );
  };

  public despawnVehicle = () => {
    if (!this.vehicle || !DoesEntityExist(this.vehicle)) {
      this.vehicle = undefined;
      this.log(`Tried to despawn vehicle at spot ${this.id} but no vehicle was present`);
      return;
    }
    DeleteEntity(this.vehicle);
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

    const stock = await RPC.execute<number>('vehicles:info:getModeltock', this.model);
    if ((stock ?? 0) <= 0) {
      Notifications.add('Dit voertuig is niet op stock!', 'error');
      return;
    }

    const header = await RPC.execute<string>('vehicles:shop:getPurchaseHeader', this.model);
    if (!header) return;
    const result = await UI.openInput({ header });
    if (!result.accepted) return;

    Events.emitNet('vehicles:shop:buyVehicle', this.id, this.model);
  };

  private allowPlayerToBuy = async () => {
    if (!this.needsEmployee) return;

    const playersInShop = await RPC.execute<{ label: string; plyId: number }[]>('vehicles:shop:getPlayersInShop');
    if (!playersInShop) {
      this.log(`Could not get players inside shop`);
      return;
    }

    const result = await UI.openInput({
      header:
        'Voor wie wil je het voertuig tekoop stellen?\nDeze persoon zal 3 minuten de tijd hebben om het voertuig te kopen.',
      inputs: [
        {
          label: 'Burger',
          name: 'target',
          type: 'select',
          options: playersInShop.map(p => ({ label: p.label, value: String(p.plyId) })),
        },
      ],
    });
    if (!result.accepted) return;

    const targetPly = Number(result.values.target);
    if (isNaN(targetPly)) {
      this.log('Input player invalid');
      return;
    }

    Events.emitNet('vehicles:shop:allowPlayerToBuy', this.id, this.model, targetPly);
  };
}
