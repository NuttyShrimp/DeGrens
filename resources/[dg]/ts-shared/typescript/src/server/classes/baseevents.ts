class BaseEvents {
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

  public onEnteringVehicle = (handler: (plyId: number, vehicle: number, seat: number) => void) => {
    onNet('baseevents:net:enteringVehicle', (vehicle: number, seat: number) => {
      handler(source, vehicle, seat);
    });
  };

  public onEnteringVehicleAborted = (handler: (plyId: number) => void) => {
    onNet('baseevents:net:enteringAborted', () => {
      handler(source);
    });
  };

  public onEnteredVehicle = (handler: (plyId: number, vehicle: number, seat: number) => void) => {
    onNet('baseevents:net:enteredVehicle', (vehicle: number, seat: number) => {
      handler(source, vehicle, seat);
    });
  };

  public onLeftVehicle = (handler: (plyId: number, vehicle: number, seat: number) => void) => {
    onNet('baseevents:net:leftVehicle', (vehicle: number, seat: number) => {
      handler(source, vehicle, seat);
    });
  };

  public onVehicleSeatChange = (
    handler: (plyId: number, vehicle: number, newSeat: number, oldSeat: number) => void
  ) => {
    onNet('baseevents:net:vehicleChangedSeat', (vehicle: number, newSeat: number, oldSeat: number) => {
      handler(source, vehicle, newSeat, oldSeat);
    });
  };

  public onVehicleEngineStateChange = (handler: (plyId: number, vehicle: number, engineState: boolean) => void) => {
    onNet('baseevents:net:engineStateChanged', (vehicle: number, engineState: boolean) => {
      handler(source, vehicle, engineState);
    });
  };
}

export default {
  BaseEvents: new BaseEvents(),
};
