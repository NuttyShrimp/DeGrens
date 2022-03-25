export const hudIcons: Record<string, Hud.HudIcon> = {
  voice: {
    name: 'microphone',
  },
  hunger: {
    name: 'apple-alt',
  },
  thirst: {
    name: 'tint',
  },
  air: {
    name: 'lungs',
  },
};

export const hudColors = {
  health: '#8DEC96',
  armor: '#8D96EC',
  hunger: '#DBA758',
  thirst: '#588DDB',
  air: '#ABBEE2',
};

export const CircleMargin = {
  right: '.15rem',
  left: '-.15rem',
  top: '0',
};

export const CircleViewbox = {
  right: '22 22.5 44 22',
  left: '22 22 44 22',
  top: '22 22 44 44',
  '0-left': '22 22.25 44 22',
  'right-top': '44 22.5 22 22',
  'right-bottom': '22 22.5 22 22',
};

export const CircleCy = {
  left: 44.75,
  right: 21.75,
  top: 44,
};

export const circleToBeSkipped = ['health', 'armor'];

export const CircleLocation = {
  1: ['top'],
  2: ['left', 'right'],
  3: ['left', 'right-top', 'right-bottom'],
  4: ['left-top', 'left-bottom', 'right-top', 'right-bottom'],
};

export enum voiceActiveColors {
  normal = '#d5b34f',
  onRadio = '#C34F4F',
}
