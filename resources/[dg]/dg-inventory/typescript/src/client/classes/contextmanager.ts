import { Events, Notifications, UI, Util } from '@dgx/client';
import { Vector3 } from '@dgx/shared';
import { Export, ExportRegister } from '@dgx/shared/decorators';
import { canOpenInventory, doCloseAnimation, doLookAnimation, doOpenAnimation } from '../util';

@ExportRegister()
class ContextManager extends Util.Singleton<ContextManager>() {
  public isInventoryOpen = false;
  private forceSecondary: IdBuildData | null;
  public closingData: { type: Inventory.Type; data?: any } | null;

  constructor() {
    super();
    this.forceSecondary = null;
    this.closingData = null;
  }

  @Export('isOpen')
  private _isOpen = () => this.isInventoryOpen;

  @Export('open')
  public openInventory = (sec?: IdBuildData) => {
    if (this.isInventoryOpen || !canOpenInventory()) {
      Notifications.add('Je kan dit momenteel niet', 'error');
      return;
    }
    this.forceSecondary = sec ?? null;
    UI.openApplication('inventory');
    this.isInventoryOpen = true;
    TriggerScreenblurFadeIn(0);
  };

  public preventedShow = () => {
    Notifications.add('Je kan dit momenteel niet', 'error');
    this.isInventoryOpen = false;
  };

  public close = () => {
    TriggerScreenblurFadeOut(0);
    if (!this.isInventoryOpen) return;

    if (this.closingData) {
      switch (this.closingData.type) {
        case 'trunk':
          doCloseAnimation();
          SetVehicleDoorShut(this.closingData.data as number, 5, false);
          break;
        case 'dumpster':
          doCloseAnimation();
          break;
      }
      this.closingData = null;
    }

    this.isInventoryOpen = false;
    Events.emitNet('inventory:server:closed');
  };

  public getSecondary = (): IdBuildData => {
    if (this.forceSecondary != null) {
      if (this.forceSecondary.type === 'dumpster') {
        this.closingData = { type: 'dumpster' };
        doOpenAnimation();
      } else {
        doLookAnimation();
      }
      return this.forceSecondary;
    }

    const ped = PlayerPedId();
    if (IsPedInAnyVehicle(ped, false)) {
      doLookAnimation();
      const vehicle = GetVehiclePedIsIn(ped, false);
      const plate = GetVehicleNumberPlateText(vehicle); // TODO: Move plates to VIN after vehicle merge
      return { type: 'glovebox', identifier: plate };
    }

    const entityAimingAt = global.exports['dg-lib'].GetCurrentEntity();
    if (entityAimingAt && IsEntityAVehicle(entityAimingAt) && GetVehicleDoorLockStatus(entityAimingAt) < 2) {
      let trunkPosition: Vector3;

      // If a trunkBone was found we check on the position of that bone. Useful for determining frontengine cars.
      // else we use the modeldimensions to check if players is at the back. Useful for motorcycles.
      const boneIndex = GetEntityBoneIndexByName(entityAimingAt, 'boot');
      if (boneIndex !== -1) {
        trunkPosition = Util.ArrayToVector3(GetWorldPositionOfEntityBone(entityAimingAt, boneIndex));
      } else {
        const [min, max] = GetModelDimensions(GetEntityModel(entityAimingAt));
        const carLength = max[1] - min[1];
        trunkPosition = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(entityAimingAt, 0, -carLength / 2, 0));
      }

      const distance = Util.getPlyCoords().distance(trunkPosition);
      if (distance < 1.5) {
        const plate = GetVehicleNumberPlateText(entityAimingAt); // TODO: Move plates to VIN after vehicle merge
        const vehicleClass = GetVehicleClass(entityAimingAt);
        SetVehicleDoorOpen(entityAimingAt, 5, false, false);
        doOpenAnimation();
        this.closingData = { type: 'trunk', data: entityAimingAt };
        return { type: 'trunk', identifier: plate, data: vehicleClass };
      }
    }

    doLookAnimation();
    const [x, y, z] = GetOffsetFromEntityInWorldCoords(PlayerPedId(), 0, 0.5, 0);
    return { type: 'drop', data: { x, y, z } };
  };
}

const contextManager = ContextManager.getInstance();
export default contextManager;
