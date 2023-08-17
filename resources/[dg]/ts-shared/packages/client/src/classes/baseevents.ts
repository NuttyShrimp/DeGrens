import { BaseEvents as SharedBaseEvents } from '@dgx/shared/src/classes';

class BaseEvents extends SharedBaseEvents {
  public onPedChange = (handler: () => void) => {
    on('baseevents:playerPedChanged', handler);
  };

  public onIdChange = (handler: () => void) => {
    on('baseevents:playerIdChanged', handler);
  };

  public onEnterWater = (handler: () => void) => {
    on('baseevents:enteredWater', handler);
  };

  public onLeftWater = (handler: () => void) => {
    on('baseevents:leftWater', handler);
  };

  public onStartDiving = (handler: () => void) => {
    on('baseevents:startedDiving', handler);
  };

  public onStopDiving = (handler: () => void) => {
    on('baseevents:stoppedDiving', handler);
  };

  public onEnteringVehicle = (handler: (vehicle: number) => void) => {
    on('baseevents:enteringVehicle', handler);
  };

  public onEnteringVehicleAborted = (handler: () => void) => {
    on('baseevents:enteringAborted', handler);
  };

  public onEnteredVehicle = (handler: (vehicle: number, seat: number) => void) => {
    on('baseevents:enteredVehicle', handler);
  };

  public onLeftVehicle = (handler: (vehicle: number, seat: number) => void) => {
    on('baseevents:leftVehicle', handler);
  };

  public onVehicleSeatChange = (handler: (vehicle: number, newSeat: number, oldSeat: number) => void) => {
    on('baseevents:vehicleChangedSeat', handler);
  };

  public onVehicleEngineStateChange = (handler: (vehicle: number, engineState: boolean) => void) => {
    on('baseevents:engineStateChanged', handler);
  };

  /**
   * Player Ped existence is ensured
   */
  public onPlayerEnteredScope = (handler: (serverId: number, localId: number) => void) => {
    on('baseevents:playerEnteredScope', handler);
  };

  public onPlayerLeftScope = (handler: (serverId: number, localId: number) => void) => {
    on('baseevents:playerLeftScope', handler);
  };
}

export default {
  BaseEvents: new BaseEvents(),
};
