export const NOTIFICATION_ID = 'stance_notif';

export const STEPS = [0.005, 0.01, 0.05];

export const WHEELS: {
  name: Stances.Wheel;
  idx: number;
  label: string;
  linked: string;
}[] = [
  {
    name: 'frontLeft',
    idx: 0,
    label: 'Front Left',
    linked: 'frontRight',
  },
  {
    name: 'frontRight',
    idx: 1,
    label: 'Front Right',
    linked: 'frontLeft',
  },
  {
    name: 'backLeft',
    idx: 2,
    label: 'Back Left',
    linked: 'backRight',
  },
  {
    name: 'backRight',
    idx: 3,
    label: 'Back Right',
    linked: 'backLeft',
  },
];
