export const expressions: RadialMenu.Entry[] = [
  {
    label: 'Drunk',
    icon: 'face-woozy',
    expression: 'mood_drunk_1',
  },
  {
    label: 'Dumb',
    icon: 'face-zany',
    expression: 'pose_injured_1',
  },
  {
    label: 'Electrocuted',
    icon: 'bolt',
    expression: 'electrocuted_1',
  },
  {
    label: 'Grumpy',
    icon: 'face-unamused',
    expression: 'effort_1',
  },
  {
    label: 'Grumpy2',
    icon: 'face-unamused',
    expression: 'mood_drivefast_1',
  },
  {
    label: 'Grumpy3',
    icon: 'face-unamused',
    expression: 'pose_angry_1',
  },
  {
    label: 'Happy',
    icon: 'face-smile',
    expression: 'mood_happy_1',
  },
  {
    label: 'Injured',
    icon: 'face-thermometer',
    expression: 'mood_injured_1',
  },
  {
    label: 'Joyful',
    icon: 'face-awesome',
    expression: 'mood_dancing_low_1',
  },
  {
    label: 'Mouthbreather',
    icon: 'face-hushed',
    expression: 'smoking_hold_1',
  },
  {
    label: 'Never Blink',
    icon: 'face-flushed',
    expression: 'pose_normal_1',
  },
  {
    label: 'One Eye',
    icon: 'face-grin-wink',
    expression: 'pose_aiming_1',
  },
  {
    label: 'Shocked',
    icon: 'face-fearful',
    expression: 'shocked_1',
  },
  {
    label: 'Shocked2',
    icon: 'face-fearful',
    expression: 'shocked_2',
  },
  {
    label: 'Sleeping',
    icon: 'face-sleeping',
    expression: 'mood_sleeping_1',
  },
  {
    label: 'Sleeping2',
    icon: 'face-sleeping',
    expression: 'dead_1',
  },
  {
    label: 'Sleeping3',
    icon: 'face-sleeping',
    expression: 'dead_2',
  },
  {
    label: 'Smug',
    icon: 'face-smirking',
    expression: 'mood_smug_1',
  },
  {
    label: 'Speculative',
    icon: 'face-meh-blank',
    expression: 'mood_aiming_1',
  },
  {
    label: 'Stressed',
    icon: 'face-grimace',
    expression: 'mood_stressed_1',
  },
  {
    label: 'Sulking',
    icon: 'face-expressionless',
    expression: 'mood_sulk_1',
  },
  {
    label: 'Weird',
    icon: 'face-disguise',
    expression: 'effort_2',
  },
  {
    label: 'Weird2',
    icon: 'face-disguise',
    expression: 'effort_3',
  },
].map(x => ({
  title: x.label,
  icon: x.icon,
  type: 'client',
  event: 'misc:expressions:set',
  data: {
    expression: x.expression,
  },
}));
