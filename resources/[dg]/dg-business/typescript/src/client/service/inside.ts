import { Events, PolyTarget } from '@dgx/client';
import { buildAnyZone } from 'helpers';
import { getBusinessConfig } from './businesses';

let insideBusiness: { name: string; type: string } | null = null;

export const getInsideBusiness = () => insideBusiness;

export const handleEnteredBusinessZone = (businessName: string, businessType: string) => {
  const businessConfig = getBusinessConfig(businessName);
  if (!businessConfig) return;

  if (insideBusiness !== null) {
    console.error(`Entered business ${businessName} while being registered as inside ${insideBusiness.name}`);
  }

  insideBusiness = {
    name: businessName,
    type: businessType,
  };
  Events.emitNet('business:server:enterBusiness', businessName);

  buildAnyZone('PolyTarget', 'business_management', businessConfig.managementZone, {
    id: businessName,
    businessType,
  });

  // build registers if they are defined
  if (businessConfig.registers) {
    for (let i = 0; i < businessConfig.registers.zones.length; i++) {
      const register = businessConfig.registers.zones[i];
      buildAnyZone('PolyTarget', 'business_register', register, {
        id: `${businessName}_${i}`,
        registerIdx: i,
        businessName,
      });
    }
  }

  // build stash if defined
  if (businessConfig.stashZone) {
    buildAnyZone('PolyTarget', 'business_stash', businessConfig.stashZone, {
      id: businessName,
    });
  }

  // build shop if defined
  if (businessConfig.shopZone) {
    buildAnyZone('PolyTarget', 'business_shop', businessConfig.shopZone, {
      id: businessName,
    });
  }

  // build craftingzone if defined
  if (businessConfig.crafting) {
    buildAnyZone('PolyTarget', 'business_crafting', businessConfig.crafting.zone, {
      id: businessName,
      benchId: businessConfig.crafting.benchId,
    });
  }

  // build on enter zones if they defined
  if (businessConfig.extraZones) {
    for (const extraZone of businessConfig.extraZones) {
      buildAnyZone(extraZone.isTarget ? 'PolyTarget' : 'PolyZone', extraZone.name, extraZone.zone, {
        ...extraZone.data,
        businessName,
      });
    }
  }
};

export const handleLeaveBusinessZone = (businessName: string) => {
  const businessConfig = getBusinessConfig(businessName);
  if (!businessConfig) return;

  if (insideBusiness === null) {
    console.error(`Left business ${businessName} while not being registered as inside any`);
  }
  insideBusiness = null;
  Events.emitNet('business:server:leaveBusiness', businessName);

  PolyTarget.removeZone('business_management');
  PolyTarget.removeZone('business_register');
  PolyTarget.removeZone('business_stash');

  // destroy on enter zones if they defined
  if (businessConfig.extraZones) {
    for (const extraZone of businessConfig.extraZones) {
      PolyTarget.removeZone(extraZone.name);
    }
  }
};
