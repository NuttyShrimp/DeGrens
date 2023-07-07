import { Business, Peek, Events, Inventory } from '@dgx/client';
import { getBusinessConfig, isBusinessTypeOptedInToModule } from 'service/businesses';
import { handleEnteredBusinessZone, handleLeaveBusinessZone } from 'service/inside';
import { isEmployee } from 'service/permscache';
import { isSignedInAtBusiness } from 'service/signin';

//#region Zones
Business.onEnterBusinessZone(handleEnteredBusinessZone);
Business.onLeaveBusinessZone(handleLeaveBusinessZone);
//#endregion

//#region Peek
Peek.addZoneEntry('business_management', {
  options: [
    {
      label: 'Inklokken',
      icon: 'fas fa-right-to-bracket',
      action: option => {
        Events.emitNet('business:server:signIn', option.data.id);
      },
      canInteract: (_, __, option) => {
        if (isSignedInAtBusiness(option.data.id)) return false;
        if (!isEmployee(option.data.id)) return false;
        return isBusinessTypeOptedInToModule(option.data.businessType, 'signin');
      },
    },
    {
      label: 'Uitklokken',
      icon: 'fas fa-right-from-bracket',
      action: option => {
        Events.emitNet('business:server:signOut', option.data.id);
      },
      canInteract: (_, __, option) => {
        if (!isSignedInAtBusiness(option.data.id)) return false;
        return isBusinessTypeOptedInToModule(option.data.businessType, 'signin');
      },
    },
    {
      label: 'Locker',
      icon: 'fas fa-box',
      action: option => {
        const cid = LocalPlayer.state.citizenid;
        if (!cid) return;
        const stashId = `${option.data.id}_${cid}`;
        Inventory.openStash(stashId, 8);
      },
      canInteract: (_, __, option) => {
        if (!isSignedInAtBusiness(option.data.id)) return false;
        return isBusinessTypeOptedInToModule(option.data.businessType, 'lockers');
      },
    },
    {
      label: 'Toon Werknemers',
      icon: 'fas fa-list',
      action: option => {
        Events.emitNet('business:server:openSignedInList', option.data.id);
      },
      canInteract: (_, __, option) => {
        if (!isSignedInAtBusiness(option.data.id)) return false;
        if (!isBusinessTypeOptedInToModule(option.data.businessType, 'signin')) return false;
        return isEmployee(option.data.id, ['change_role']);
      },
    },
    {
      label: 'Wijzig Prijzen',
      icon: 'fas fa-money-check-dollar-pen',
      action: option => {
        Events.emitNet('business:server:openPriceMenu', option.data.id);
      },
      canInteract: (_, __, option) => {
        if (!isSignedInAtBusiness(option.data.id)) return false;
        if (!isEmployee(option.data.id, ['change_role'])) return false;
        return !!getBusinessConfig(option.data.id)?.priceItems; // only show if price items are defined
      },
    },
    {
      label: 'Toon Diensturen',
      icon: 'fas fa-list',
      action: option => {
        Events.emitNet('misc:dutytime:showList', option.data.id);
      },
      canInteract: (_, __, option) => {
        if (!isSignedInAtBusiness(option.data.id)) return false;
        if (!isBusinessTypeOptedInToModule(option.data.businessType, 'signin')) return false;
        return isEmployee(option.data.id, ['change_role']);
      },
    },
  ],
  distance: 3,
});

Peek.addZoneEntry('business_register', {
  options: [
    {
      label: 'Betalen',
      icon: 'fas fa-cash-register',
      action: option => {
        Events.emitNet('business:server:checkRegister', option.data.businessName, option.data.registerIdx);
      },
    },
    {
      label: 'Bestelling maken',
      icon: 'fas fa-input-numeric',
      action: async option => {
        Events.emitNet('business:server:trySetRegister', option.data.businessName, option.data.registerIdx);
      },
      canInteract: (_, __, option) => isSignedInAtBusiness(option.data.businessName),
    },
    {
      label: 'Annuleren',
      icon: 'fas fa-file-slash',
      action: option => {
        Events.emitNet('business:server:cancelRegister', option.data.businessName, option.data.registerIdx);
      },
      canInteract: (_, __, option) => isSignedInAtBusiness(option.data.businessName),
    },
    {
      label: 'Aanrecht',
      icon: 'fas fa-inbox',
      action: option => {
        const stashId = `${option.data.businessName}_register_${option.data.registerIdx}`;
        Inventory.openStash(stashId, 7);
      },
    },
  ],
  distance: 2,
});

Peek.addZoneEntry('business_stash', {
  options: [
    {
      label: `Open Stash`,
      icon: 'fas fa-box-open',
      action: option => {
        const stashId = `${option.data.id}_stash`;
        Inventory.openStash(stashId, 100);
      },
      canInteract: (_, __, option) => isEmployee(option.data.id, ['stash']),
    },
  ],
  distance: 3,
});

Peek.addZoneEntry('business_shop', {
  options: [
    {
      label: 'Bekijk Voorraad',
      icon: 'fas fa-basket-shopping',
      action: option => {
        Events.emitNet('business:server:checkShop', option.data.id);
      },
    },
    {
      label: 'Voorraad Bijvullen',
      icon: 'fas fa-inbox-full',
      action: option => {
        const stashId = `${option.data.id}_shop`;
        Inventory.openStash(stashId);
      },
      canInteract: (_, __, option) => {
        return isSignedInAtBusiness(option.data.id);
      },
    },
  ],
});

Peek.addZoneEntry('business_crafting', {
  options: [
    {
      label: 'Product Maken',
      icon: 'fas fa-plus',
      action: option => {
        Inventory.openBench(option.data.benchId);
      },
      canInteract: (_, __, option) => {
        return isSignedInAtBusiness(option.data.id);
      },
    },
  ],
});
//#endregion
