export const DROPOFF_TYPE_DATA: Record<
  Carboosting.DropoffType,
  {
    label: string;
    icon: string;
    peekDistance?: number;
    taskbar: {
      duration: number;
      animation: TaskBar.Animation;
    };
  }
> = {
  boost: {
    label: 'Afleveren',
    icon: 'file-contract',
    taskbar: {
      duration: 7500,
      animation: {
        animDict: 'missexile3',
        anim: 'ex03_dingy_search_case_a_michael',
        flags: 1,
      },
    },
  },
  scratch: {
    label: 'Scratch VIN',
    icon: 'input-numeric',
    peekDistance: 10,
    taskbar: {
      duration: 20000,
      animation: {
        animDict: 'mini@repair',
        anim: 'fixing_a_player',
        flags: 1,
      },
    },
  },
};
