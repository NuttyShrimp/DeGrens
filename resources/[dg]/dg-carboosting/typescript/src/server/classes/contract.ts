import { Police, Util, Vehicles } from '@dgx/server';
import { getClassConfig } from 'helpers/config';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import contractManager from './contractmanager';

export class Contract {
  private id: number;
  private logger: winston.Logger;
  public readonly model: string;
  public readonly vehicleClass: Vehicles.Class;
  private readonly brand: string;
  private readonly name: string;
  private owner: number | null;

  private expirationTime: number;
  private expirationTimeout: NodeJS.Timeout;

  constructor(id: number, model: string, ownerCid?: number) {
    this.id = id;
    this.logger = mainLogger.child({ module: `Contract ${this.id}` });
    this.model = model;

    // get associated vehicle class
    const vehConfig = Vehicles.getConfigByModel(model);
    if (!vehConfig) throw new Error(`Could not find class for model ${model}`);

    this.vehicleClass = vehConfig.class;
    this.brand = vehConfig.brand;
    this.name = vehConfig.name;

    // validate owner param
    if (getClassConfig(this.vehicleClass).contractType === 'personal') {
      if (!ownerCid) throw new Error('creating personal contract without providing owner');
    }
    this.owner = ownerCid ?? null;

    const expirationDelay = getClassConfig(this.vehicleClass).expirationTime * 60 * 1000;
    this.expirationTime = Date.now() + expirationDelay;
    this.expirationTimeout = setTimeout(() => {
      this.destroy();
    }, expirationDelay);

    this.logger.silly(
      `Created | model: ${this.model} | class: ${this.vehicleClass}${ownerCid ? ` | owner: ${ownerCid}` : ''}`
    );
  }

  public getOwner = () => this.owner;

  public canPlayerDoContract = (cid: number, reputation?: number) => {
    if (reputation === undefined) {
      reputation = contractManager.getReputation(cid);
    }
    if (getClassConfig(this.vehicleClass).reputation.required > reputation) return false;
    return this.owner === null || this.owner === cid;
  };

  public destroy = () => {
    clearTimeout(this.expirationTimeout);
    contractManager.unregisterContract(this.id);
    this.logger.debug(`Destroyed`);
  };

  public buildUIData = (): Carboosting.Contracts.UIData => ({
    id: this.id,
    class: this.vehicleClass,
    brand: this.brand,
    name: this.name,
    expirationTime: this.expirationTime,
    price: getClassConfig(this.vehicleClass).price,
    disabledActions: {
      // disable start actions if police reqs are not met
      boost: !contractManager.areClassPoliceRequirementsMet(this.vehicleClass, 'boost'),
      scratch: !contractManager.areClassPoliceRequirementsMet(this.vehicleClass, 'scratch'),
      decline: this.owner === null,
    },
  });
}
