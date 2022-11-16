import { Events, Notifications, RayCast, RPC, UI, Util } from '@dgx/client';
import { Vector3 } from '@dgx/shared';
import { Export, ExportRegister } from '@dgx/shared/decorators';
import { TYPES_WITH_OPEN_ANIMATION } from '../constants';
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

  @Export('close')
  public close = () => {
    TriggerScreenblurFadeOut(0);
    if (!this.isInventoryOpen) return;

    if (this.closingData) {
      if (this.closingData.type === 'trunk') {
        Util.setVehicleDoorOpen(this.closingData.data as number, 5, false);
      }
      if (TYPES_WITH_OPEN_ANIMATION.includes(this.closingData.type)) {
        doCloseAnimation();
      }
      this.closingData = null;
    }

    this.isInventoryOpen = false;
    Events.emitNet('inventory:server:closed');
  };

  public getSecondary = async (): Promise<IdBuildData> => {
    if (this.forceSecondary != null) {
      if (TYPES_WITH_OPEN_ANIMATION.includes(this.forceSecondary.type)) {
        this.closingData = { type: this.forceSecondary.type };
        doOpenAnimation();
      } else {
        doLookAnimation();
      }
      return this.forceSecondary;
    }

    const ped = PlayerPedId();
    if (IsPedInAnyVehicle(ped, false)) {
      const vin = await Util.getVehicleVin();
      if (vin) {
        doLookAnimation();
        return { type: 'glovebox', identifier: vin };
      }
    }

    const { entity: entityAimingAt } = RayCast.doRaycast();
    if (entityAimingAt && IsEntityAVehicle(entityAimingAt) && NetworkGetEntityIsNetworked(entityAimingAt)) {
      if (GetVehicleDoorLockStatus(entityAimingAt) < 2) {
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
          const vin = await Util.getVehicleVin(entityAimingAt);
          if (vin) {
            const vehicleClass = GetVehicleClass(entityAimingAt);
            Util.setVehicleDoorOpen(entityAimingAt, 5, true);
            doOpenAnimation();
            this.closingData = { type: 'trunk', data: entityAimingAt };
            return { type: 'trunk', identifier: vin, data: vehicleClass };
          }
        }
      } else {
        Notifications.add('Voertuig staat op slot', 'error');
      }
    }

    doLookAnimation();
    const [x, y, z] = GetOffsetFromEntityInWorldCoords(PlayerPedId(), 0, 0.5, 0);
    return { type: 'drop', data: { x, y, z } };
  };
}

const contextManager = ContextManager.getInstance();
export default contextManager;
