import { Minigames } from '@dgx/client';

export const degradationValues: Record<keyof Service.Status, (Service.Degradation & { step: number })[]> = {
  engine: [],
  axle: [],
  brakes: [],
  suspension: [],
};

export const setDegradationValues = (config: Service.DegradationConfig) => {
  for (const part of Object.keys(config) as (keyof Service.Status)[]) {
    for (const value of config[part]) {
      degradationValues[part].push({
        ...value,
        step: (1 - value.percent) / 1000,
      });
    }
  }
};

export const MINIMUM_DAMAGE_FOR_GUARANTEED_STALL = 65;
export const MINIMUM_DAMAGE_FOR_STALL = 20;

export const REPAIR_ITEMS: Record<
  string,
  {
    keygame: Parameters<typeof Minigames.keygame>;
    taskbar: {
      icon: string;
      label: string;
      time: number;
      animation: {
        animDict: string;
        anim: string;
        flags: 1;
      };
    };
  }
> = {
  repair_kit: {
    keygame: [5, 5, 15],
    taskbar: {
      icon: 'engine',
      label: 'Herstellen',
      time: 15000,
      animation: {
        animDict: 'mini@repair',
        anim: 'fixing_a_ped',
        flags: 1,
      },
    },
  },
  advanced_repair_kit: {
    keygame: [7, 5, 15],
    taskbar: {
      icon: 'engine',
      label: 'Herstellen',
      time: 30000,
      animation: {
        animDict: 'mini@repair',
        anim: 'fixing_a_ped',
        flags: 1,
      },
    },
  },
  tire_repair_kit: {
    keygame: [4, 7, 15],
    taskbar: {
      icon: 'tire',
      label: 'Vervangen',
      time: 20000,
      animation: {
        animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
        anim: 'machinic_loop_mechandplayer',
        flags: 1,
      },
    },
  },
};
