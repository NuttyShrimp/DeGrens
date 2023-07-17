import { Events } from '@dgx/server';
import config from 'services/config';
import { spawnTrolleys } from 'services/trolleys';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

export class HeistLocation {
  private readonly logger: winston.Logger;

  private readonly id: Heists.LocationId;
  private readonly type: Heists.HeistType;
  private readonly insidePlayers: Set<number>;

  private readonly usedServices: Record<Heists.Service, boolean>;

  private done: boolean;
  private doorState: Heists.Door.State;

  constructor(locationId: Heists.LocationId) {
    const locationConfig = config.locations[locationId];
    if (!locationConfig) throw new Error(`Tried to create heistlocation for unknown locationId ${locationId}`);

    this.logger = mainLogger.child({ module: locationId });
    this.id = locationId;
    this.type = locationConfig.type;
    this.insidePlayers = new Set();

    this.usedServices = {
      door: !!locationConfig.door,
      laptop: !!locationConfig.laptopCoords,
      trolleys: !!locationConfig.trolleys,
    };

    this.done = false;
    this.doorState = 'closed';

    this.dispatchDoorState();
  }

  public playerEntered = (plyId: number) => {
    this.insidePlayers.add(plyId);
    this.dispatchDoorState(plyId);

    this.logger.debug(`player ${plyId} has entered`);
  };

  public playerLeft = (plyId: number) => {
    this.insidePlayers.delete(plyId);
    this.logger.debug(`player ${plyId} has left`);
  };

  public isPlayerInside = (plyId: number) => {
    return this.insidePlayers.has(plyId);
  };

  public getDoorState = () => {
    return this.doorState === 'open';
  };

  public setDoorState = (state: boolean) => {
    if (!this.usedServices.door) return;

    this.doorState = state ? 'open' : 'closed';
    this.dispatchDoorState();
    this.logger.debug(`doorstate changed to ${this.doorState}`);
  };

  private dispatchDoorState = (plyId = -1) => {
    if (!this.usedServices.door) return;

    const doorConfig = config.locations[this.id].door;
    this.insidePlayers.forEach(ply => {
      Events.emitNet('heists:location:setDoorState', ply, doorConfig, this.doorState);
    });
  };

  public getHeistType = () => this.type;

  public isDone = () => this.done;

  public setDone = () => {
    this.done = true;
    this.logger.debug(`Registered as done`);
  };

  public isServiceUsed = (service: Heists.Service) => {
    return this.usedServices[service];
  };

  public spawnTrolleys = () => {
    if (!this.isServiceUsed('trolleys')) return;
    spawnTrolleys(this.id);
    this.logger.debug('Spawning trolleys');
  };

  public getPlayersInside = () => [...this.insidePlayers];

  public getAmountOfPlayersInside = () => this.insidePlayers.size;
}
