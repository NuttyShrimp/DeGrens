import { BaseEvents as SharedBaseEvents } from '@dgx/shared/src/classes';

class BaseEvents extends SharedBaseEvents {
  public onEnterWater = (handler: (plyId: number) => void) => {
    onNet('baseevents:net:enteredWater', () => {
      handler(source);
    });
  };

  public onLeftWater = (handler: (plyId: number) => void) => {
    onNet('baseevents:net:leftWater', () => {
      handler(source);
    });
  };

  public onStartDiving = (handler: (plyId: number) => void) => {
    onNet('baseevents:net:startedDiving', () => {
      handler(source);
    });
  };

  public onStopDiving = (handler: (plyId: number) => void) => {
    onNet('baseevents:net:stoppedDiving', () => {
      handler(source);
    });
  };

  public onEnteringVehicle = (handler: (plyId: number, vehicle: number, vehicleClass: number) => void) => {
    onNet('baseevents:net:enteringVehicle', (vehicle: number, vehicleClass: number) => {
      handler(source, vehicle, vehicleClass);
    });
  };

  public onEnteringVehicleAborted = (handler: (plyId: number) => void) => {
    onNet('baseevents:net:enteringAborted', () => {
      handler(source);
    });
  };

  public onEnteredVehicle = (handler: (plyId: number, netId: number, seat: number) => void) => {
    onNet('baseevents:net:enteredVehicle', (netId: number, seat: number) => {
      handler(source, netId, seat);
    });
  };

  public onLeftVehicle = (handler: (plyId: number, netId: number, seat: number) => void) => {
    onNet('baseevents:net:leftVehicle', (netId: number, seat: number) => {
      handler(source, netId, seat);
    });
  };

  public onVehicleSeatChange = (handler: (plyId: number, netId: number, newSeat: number, oldSeat: number) => void) => {
    onNet('baseevents:net:vehicleChangedSeat', (netId: number, newSeat: number, oldSeat: number) => {
      handler(source, netId, newSeat, oldSeat);
    });
  };

  public onVehicleEngineStateChange = (handler: (plyId: number, netId: number, engineState: boolean) => void) => {
    onNet('baseevents:net:engineStateChanged', (netId: number, engineState: boolean) => {
      handler(source, netId, engineState);
    });
  };
}

export default {
  BaseEvents: new BaseEvents(),
};
