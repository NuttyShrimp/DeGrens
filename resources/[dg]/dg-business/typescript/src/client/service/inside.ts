import { Events, PolyTarget, PolyZone } from '@dgx/client';
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

  PolyTarget.buildAnyZone('business_management', businessConfig.managementZone, {
    id: businessName,
    businessType,
  });

  // build registers if they are defined
  if (businessConfig.registers) {
    for (let i = 0; i < businessConfig.registers.zones.length; i++) {
      const register = businessConfig.registers.zones[i];
      PolyTarget.buildAnyZone('business_register', register, {
        id: `${businessName}_${i}`,
        registerIdx: i,
        businessName,
      });
    }
  }

  // build stash if defined
  if (businessConfig.stashZone) {
    PolyTarget.buildAnyZone('business_stash', businessConfig.stashZone, {
      id: businessName,
    });
  }

  // build shop if defined
  if (businessConfig.shopZone) {
    PolyTarget.buildAnyZone('business_shop', businessConfig.shopZone, {
      id: businessName,
    });
  }

  // build craftingzone if defined
  if (businessConfig.crafting) {
    PolyTarget.buildAnyZone('business_crafting', businessConfig.crafting.zone, {
      id: businessName,
      benchId: businessConfig.crafting.benchId,
    });
  }

  // build on enter zones if they defined
  if (businessConfig.extraZones) {
    for (const extraZone of businessConfig.extraZones) {
      (extraZone.isTarget ? PolyTarget : PolyZone).buildAnyZone(extraZone.name, extraZone.zone, {
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
  PolyTarget.removeZone('business_shop');
  PolyTarget.removeZone('business_crafting');

  // destroy on enter zones if they defined
  if (businessConfig.extraZones) {
    for (const extraZone of businessConfig.extraZones) {
      (extraZone.isTarget ? PolyTarget : PolyZone).removeZone(extraZone.name);
    }
  }
};
