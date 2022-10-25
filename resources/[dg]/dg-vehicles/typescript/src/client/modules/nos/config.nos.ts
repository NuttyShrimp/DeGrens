import { RPC } from '@dgx/client';

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

setImmediate(async () => {
  const config = await RPC.execute<typeof nosConfig>('vehicles:nos:getConfig');
  if (!config) {
    throw new Error('Failed to load NOS Config');
  }
  nosConfig = config;
});
