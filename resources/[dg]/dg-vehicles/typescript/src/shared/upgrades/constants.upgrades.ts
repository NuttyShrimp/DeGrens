export const TUNE_PARTS: Record<
  Upgrades.Tune,
  {
    amount: number;
    label: string;
    itemName: string;
  }
> = {
  brakes: {
    amount: 3,
    label: 'Remmen',
    itemName: 'tune_brakes',
  },
  engine: {
    amount: 4,
    label: 'Motor',
    itemName: 'tune_engine',
  },
  transmission: {
    amount: 3,
    label: 'Transmissie',
    itemName: 'tune_transmission',
  },
  turbo: {
    amount: 1,
    label: 'Turbo',
    itemName: 'tune_turbo',
  },
  suspension: {
    amount: 4,
    label: 'Ophanging',
    itemName: 'tune_suspension',
  },
};
