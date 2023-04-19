import { Util, Financials, UI, Notifications, Phone } from '@dgx/server';
import config from 'services/config';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import repository from './Repository';
import lockersManager from './LockersManager';
import { getCurrentDay } from 'helpers';

export class Locker {
  private readonly logger: winston.Logger;

  private readonly _id: string;
  private readonly coords: Vec3;
  private readonly radius: number;
  private owner: number | null;
  private password: string | null;
  private price: number;
  private paymentDay: number;

  private activePlayers: Set<number>;

  constructor(data: Lockers.Locker) {
    this.logger = mainLogger.child({ module: data.id });

    this._id = data.id;
    this.coords = data.coords;
    this.radius = data.radius;
    this.owner = data.owner;
    this.password = data.password;
    this.price = data.price;
    this.paymentDay = data.paymentDay;

    this.activePlayers = new Set();
  }

  public get id() {
    return this._id;
  }
  public get data(): Lockers.Locker {
    return {
      id: this.id,
      coords: this.coords,
      radius: this.radius,
      owner: this.owner,
      password: this.password,
      price: this.price,
      paymentDay: this.paymentDay,
    };
  }

  public view = (plyId: number) => {
    Util.Log('lockers:view', { id: this.id }, `${Util.getName(plyId)} viewed locker ${this.id}`, plyId);
    this.logger.silly(`${Util.getName(plyId)} viewed locker ${this.id}`);

    // If not owned, show buy menu
    if (this.owner === null) {
      this.tryToBuy(plyId);
      return;
    }

    this.open(plyId);
  };

  private updatePaymentDate = () => {
    const paymentDay = getCurrentDay() + config.debtIntervalInDays;
    repository.updatePaymentDay(this.id, paymentDay);
    this.paymentDay = paymentDay;
  };

  // Every 7 days a maintenance fee gets given to owner, owner has 14 days to pay before losing ownership
  public checkMaintenanceFee = () => {
    const currentDay = getCurrentDay();
    if (this.owner === null) return;
    if (currentDay < this.paymentDay) return;

    const debtPrice = Financials.getTaxedPrice(this.price * config.debtPercentage, config.taxId).taxPrice;
    Financials.giveFine(
      this.owner,
      'BE1',
      debtPrice,
      'Locker Onderhoudskosten',
      'DG Real Estate',
      undefined,
      'lockers:server:lockerDefaulted',
      7
    );
    this.updatePaymentDate();
    this.logger.silly(`Given maintenance fee to owner ${this.owner}`);
  };

  private tryToBuy = async (plyId: number) => {
    const priceWithTax = Financials.getTaxedPrice(this.price, config.taxId)?.taxPrice;

    const result = await UI.openInput<{}>(plyId, {
      header: `Wil je deze storage unit aankopen voor €${priceWithTax}?\nElke ${
        config.debtIntervalInDays
      } dagen zal er een onderhoudskost aangerekend worden van ${Math.round(
        config.debtPercentage * 100
      )}% van dit bedrag.`,
    });
    if (!result.accepted) return;

    if (lockersManager.doesPlayerOwnLocker(plyId)) {
      Notifications.add(plyId, 'Je bent al eigenaar van een storage unit', 'error');
      return;
    }

    const cid = Util.getCID(plyId);
    const accId = Financials.getDefaultAccountId(cid);
    if (!accId) return;
    const succesfullyPaid = await Financials.purchase(accId, cid, this.price, `Aankoop storage unit`, config.taxId);
    if (!succesfullyPaid) {
      Notifications.add(plyId, 'Er is iets misgelopen met de aankoop', 'error');
      return;
    }

    Notifications.add(plyId, 'Je hebt deze storage unit aangekocht', 'success');
    this.owner = cid;
    repository.updateOwner(this.id, cid);

    // Default to empty string incase player declines password change after buying lockers
    // He would get locked ouf because password would stay null
    repository.updatePassword(this.id, '');

    this.updatePaymentDate();
    this.changePassword(plyId);

    Util.Log(
      'lockers:bought',
      { id: this.id, priceWithTax },
      `${Util.getName(plyId)} bought locker ${this.id} for ${priceWithTax}`,
      plyId
    );
    this.logger.silly(`${Util.getName(plyId)} bought locker ${this.id} for ${priceWithTax}`);
  };

  public removeOwnership = async () => {
    this.owner = null;
    repository.updateOwner(this.id, null);
    repository.updatePassword(this.id, null);
  };

  private open = async (plyId: number) => {
    if (!this.activePlayers.has(plyId)) {
      const result = await UI.openInput<{ password: string }>(plyId, {
        header: '',
        inputs: [
          {
            type: 'password',
            label: 'Wachtwoord',
            name: 'password',
          },
        ],
      });
      if (!result.accepted) return;

      if (result.values.password !== this.password) {
        Notifications.add(plyId, 'Toegang geweigerd', 'error');
        this.logger.silly(`Player ${Util.getName(plyId)} inputted wrong password ${result.values.password}`);
        Util.Log(
          'lockers:wrongPassword',
          { password: result.values.password },
          `${Util.getName(plyId)} inputted wrong password`,
          plyId
        );
        return;
      }

      // allow ply to access for 5 minutes
      this.activePlayers.add(plyId);
      setTimeout(() => {
        this.activePlayers.delete(plyId);
      }, 5 * 60 * 1000);

      Notifications.add(plyId, 'Je hebt toegang voor 5 minuten', 'success');
    }

    const menu: ContextMenu.Entry[] = [
      {
        title: 'Open',
        callbackURL: 'lockers/open',
        data: {
          id: this.id,
        },
      },
    ];

    if (this.owner === Util.getCID(plyId)) {
      menu.push(
        {
          title: 'Wachtwoord Veranderen',
          callbackURL: 'lockers/changePassword',
          data: {
            id: this.id,
          },
        },
        {
          title: 'Eigenaar Veranderen',
          callbackURL: 'lockers/transferOwnership',
          data: {
            id: this.id,
          },
        }
      );
    }

    UI.openContextMenu(plyId, menu);
    Util.Log('lockers:open', { id: this.id }, `${Util.getName(plyId)} opened locker ${this.id}`, plyId);
    this.logger.silly(`${Util.getName(plyId)} opened locker ${this.id}`);
  };

  public changePassword = async (plyId: number) => {
    if (this.owner !== Util.getCID(plyId)) {
      const logMsg = `${Util.getName(plyId)}(${plyId}) tried to change password for locker ${
        this.id
      } but was not owner`;
      Util.Log('lockers:notOwner', { id: this.id }, logMsg, plyId, true);
      this.logger.warn(logMsg);
      return;
    }

    const result = await UI.openInput<{ password: string; confirmPassword: string }>(plyId, {
      header: 'Geef een nieuw wachtwoord in',
      inputs: [
        {
          type: 'password',
          label: 'Wachtwoord',
          name: 'password',
        },
        {
          type: 'password',
          label: 'Confirm Wachtwoord',
          name: 'confirmPassword',
        },
      ],
    });
    if (!result.accepted) return;

    if (result.values.password !== result.values.confirmPassword) {
      Notifications.add(plyId, 'Wachtwoorden kwamen niet overeen', 'error');
      return;
    }

    this.password = result.values.password;
    repository.updatePassword(this.id, this.password);
    Notifications.add(plyId, 'Je hebt het wachtwoord aangepast', 'success');

    // clear cached players that still had access because of time
    this.activePlayers.clear();

    Util.Log(
      'locker:changePassword',
      { id: this.id, password: this.password },
      `${Util.getName(plyId)} changed password for locker ${this.id}`,
      plyId
    );
    this.logger.silly(`${Util.getName(plyId)} changed password for locker ${this.id}`);
  };

  public transferOwnership = async (plyId: number) => {
    const currentOwner = this.owner;
    if (currentOwner !== Util.getCID(plyId)) {
      const logMsg = `${Util.getName(plyId)}(${plyId}) tried to transfer ownership for locker ${
        this.id
      } but was not owner`;
      Util.Log('lockers:notOwner', { id: this.id }, logMsg, plyId, true);
      this.logger.warn(logMsg);
      return;
    }

    const result = await UI.openInput<{ cid: string }>(plyId, {
      header: 'Geef CID van nieuwe owner',
      inputs: [
        {
          type: 'number',
          label: 'CID',
          name: 'cid',
        },
      ],
    });
    if (!result.accepted) return;

    const newOwner = Number(result.values.cid);
    if (isNaN(newOwner)) return;

    const ownerServerId = DGCore.Functions.getPlyIdForCid(newOwner);
    if (!ownerServerId) {
      Notifications.add(plyId, 'Deze persoon is niet in de stad', 'error');
      return;
    }

    const ownerAccepted = await Phone.notificationRequest(ownerServerId, {
      id: `locker_request_${this.id}_${ownerServerId}`,
      title: 'Lockers',
      description: 'Aanvaard Eigenaarschap',
      icon: 'info',
      timer: 30,
    });

    if (!ownerAccepted) {
      Notifications.add(plyId, 'Aanbod afgewezen');
      return;
    }

    this.owner = newOwner;
    repository.updateOwner(this.id, newOwner);
    Notifications.add(
      plyId,
      `Burger ${newOwner} is nu eigenaar. Openstaande fees zal je nog moeten betalen`,
      'success'
    );
    Notifications.add(ownerServerId, `Je bent nu eigenaar van een locker`, 'success');

    const logMsg = `${Util.getName(plyId)}(${plyId}) has transfered ownership for locker ${this.id} to ${newOwner}`;
    Util.Log('locker:transferOwnership', { id: this.id, oldOwner: currentOwner, newOwner }, logMsg, plyId);
    this.logger.silly(logMsg);
  };
}