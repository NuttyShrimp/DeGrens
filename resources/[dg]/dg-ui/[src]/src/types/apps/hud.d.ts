declare namespace Hud {
  type HudType = 'health' | 'armor' | 'hunger' | 'thirst' | 'air';
  type HudCircleType = 'right' | 'left' | 'top';

  interface Compass {
    visible: boolean;
    heading: number;
    zone: string;
    street: string;
  }

  interface Voice {
    normal: boolean;
    onRadio: boolean;
  }

  interface HudValue {
    enabled: boolean;
    value: number;
  }

  interface HudIcon {
    name: string;
    /**
     * Defaults to fas
     */
    lib?: string;
  }

  interface State extends State.Base {
    compass: Compass;
    values: Record<HudType, HudValue>;
    voice: Voice;
    /**
     * Indent of icons shown (0 == first extra circle)
     */
    iconIdx: number;
  }

  interface Props extends State, State.BaseProps {}
}
