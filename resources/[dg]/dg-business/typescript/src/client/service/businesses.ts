import { BlipManager } from '@dgx/client';
import { buildAnyZone } from 'helpers';

let businessesConfig: Record<string, Business.BusinessConfig> = {};
let typesConfig: Record<string, Business.BusinessTypeConfig> = {};

export const getBusinessConfig = (businessName: string): Business.BusinessConfig | undefined => {
  return businessesConfig[businessName];
};

export const getBusinessTypeConfig = (businessType: string): Business.BusinessTypeConfig | undefined => {
  return typesConfig[businessType];
};

export const loadBusinesses = (
  bConfig: typeof businessesConfig,
  tConfig: typeof typesConfig,
  bInfo: Record<string, Business.Info>
) => {
  businessesConfig = bConfig;
  typesConfig = tConfig;

  for (const [businessName, businessConfig] of Object.entries(businessesConfig)) {
    const businessInfo = bInfo[businessName];
    if (!businessInfo) continue;

    // build general businesszone
    buildAnyZone('PolyZone', 'business', businessConfig.businessZone, {
      id: businessName,
      businessType: businessInfo.business_type.name,
    });

    // if blip is defined for business config, add it to map
    if (businessConfig.blip) {
      BlipManager.addBlip({
        id: businessName,
        category: 'business',
        text: businessInfo.label,
        scale: 0.8,
        ...businessConfig.blip,
      });
    }
  }
};

export const isBusinessTypeOptedInToModule = (
  businessType: string,
  module: Exclude<keyof (typeof typesConfig)[string], 'permissions'>
) => {
  const type = typesConfig[businessType];
  if (!type) return false;
  return module in type;
};
