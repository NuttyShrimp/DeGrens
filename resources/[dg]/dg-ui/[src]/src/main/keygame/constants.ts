import { baseStyle } from '@src/base.styles';

export const ARROW_COLORS: Record<Keygame.ArrowColor, string> = {
  normal: baseStyle.gray.light,
  success: baseStyle.secondary.normal,
  fail: baseStyle.tertiary.dark,
};

export const PATH_LENGTH = 78.55074310302734;

export const DIRECTIONS: Keygame.Direction[] = ['up', 'down', 'left', 'right'];

export const DEFAULT_PATH = 'M 80.7106 20 A 50 50 0 0 0 10 20';

export const KEYCODE_TO_DIRECTION: Record<string, Keygame.Direction> = {
  KeyW: 'up',
  KeyA: 'left',
  KeyS: 'down',
  KeyD: 'right',
};
