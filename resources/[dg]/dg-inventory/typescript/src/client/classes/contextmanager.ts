import { Events, Notifications, RayCast, Sync, UI, Util, Vehicles, ExportDecorators } from '@dgx/client';
import { DGXEvent, EventListener } from '@dgx/client/src/decorators';
import { TYPES_WITH_OPEN_ANIMATION } from '../constants';
import { canOpenInventory, doCloseAnimation, doLookAnimation, doOpenAnimation } from '../util';
import { isInNoDropZone } from 'services/nodropzones';

const { ExportRegister, Export } = ExportDecorators<'inventory'>();

@ExportRegister()
@EventListener()
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
  private _isOpen() {
    return this.isInventoryOpen;
  }

  @Export('open')
  @DGXEvent('inventory:client:open')
  public openInventory(sec?: IdBuildData) {
    if (this.isInventoryOpen || !canOpenInventory()) {
      Notifications.add('Je kan dit momenteel niet', 'error');
      return;
    }
    this.forceSecondary = sec ?? null;
    UI.SetCursorLocation(0.5, 0.5);
    UI.openApplication('inventory');
    this.isInventoryOpen = true;
    TriggerScreenblurFadeIn(0);
  }

  public close = () => {
    TriggerScreenblurFadeOut(0);
    if (!this.isInventoryOpen) return;

    if (this.closingData) {
      if (this.closingData.type === 'trunk') {
        Sync.executeAction('setVehicleDoorOpen', this.closingData.data as number, 5, false);
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
      if ('type' in this.forceSecondary && TYPES_WITH_OPEN_ANIMATION.includes(this.forceSecondary.type)) {
        this.closingData = { type: this.forceSecondary.type };
        doOpenAnimation();
      } else {
        doLookAnimation();
      }
      return this.forceSecondary;
    }

    const ped = PlayerPedId();
    if (IsPedInAnyVehicle(ped, false)) {
      const vin = await Vehicles.getVehicleVin();
      if (vin) {
        doLookAnimation();
        return { type: 'glovebox', identifier: vin };
      }
    }

    const { entity: entityAimingAt } = RayCast.doRaycast();
    if (entityAimingAt && IsEntityAVehicle(entityAimingAt) && NetworkGetEntityIsNetworked(entityAimingAt)) {
      if (Vehicles.isNearVehiclePlace(entityAimingAt, 'boot', 2)) {
        if (GetVehicleDoorLockStatus(entityAimingAt) < 2) {
          const vin = await Vehicles.getVehicleVin(entityAimingAt);
          if (vin) {
            const vehicleClass = GetVehicleClass(entityAimingAt);
            Sync.executeAction('setVehicleDoorOpen', entityAimingAt, 5, true);
            doOpenAnimation();
            this.closingData = { type: 'trunk', data: entityAimingAt };
            return { type: 'trunk', identifier: vin, data: vehicleClass };
          }
        } else {
          Notifications.add('Voertuig staat op slot', 'error');
        }
      }
    }

    doLookAnimation();
    const [x, y, z] = GetOffsetFromEntityInWorldCoords(PlayerPedId(), 0, 0.5, 0);
    return {
      type: 'drop',
      data: {
        coords: { x, y, z },
        inNoDropZone: isInNoDropZone(),
      },
    };
  };
}

const contextManager = ContextManager.getInstance();
export default contextManager;
