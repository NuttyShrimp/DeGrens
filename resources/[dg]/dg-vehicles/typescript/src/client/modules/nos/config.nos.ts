import { Events, RPC } from '@dgx/client';

let nosConfig: {
  refillAmount: number;
  maxPortion: number;
  useTimeout: number;
  flowrates: {
    label: string;
    depletionTick: number;
    powerMultiplier: number;
  }[];
};

export const getNosConfig = () => nosConfig;

Events.onNet('vehicles:nos:setConfig', (config: typeof nosConfig) => {
  nosConfig = config;
});
