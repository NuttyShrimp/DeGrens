type UICallback = (info: { data: any; meta: { ok: boolean; message: string } }) => void;

declare interface ProgressBarData {
  name: string;
  label: string;
  duration: number;
  useWhileDead: boolean;
  canCancel: boolean;
  controlDisables?: {
    disableMovement?: boolean;
    disableCarMovement?: boolean;
    disableMouse?: boolean;
    disableCombat?: boolean;
  };
  animation?: ProgressbarAnimation;
  prop?: ProgressbarProp;
  propTwo?: ProgressbarProp;
}
