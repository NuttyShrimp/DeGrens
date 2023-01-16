import { MutableRefObject, useEffect, useRef } from 'react';
import { useConfigmenuStore } from '@src/main/configmenu/stores/useConfigmenuStore';

const QWERTY_TO_AZERTY = {
  '`': '²',
  '1': '&',
  '!': '1',
  '2': 'é',
  '@': '2',
  '3': '"',
  '#': '3',
  '4': "'",
  $: '4',
  '5': '(',
  '%': '5',
  '6': '-',
  '^': '6',
  '7': 'è',
  '&': '7',
  '8': '_',
  '*': '8',
  '9': 'ç',
  '(': '9',
  '0': 'à',
  ')': '0',
  '-': ')',
  _: '°',
  '=': '=',
  '+': '+',
  q: 'a',
  w: 'z',
  e: 'e',
  r: 'r',
  t: 't',
  y: 'y',
  u: 'u',
  i: 'i',
  o: 'o',
  p: 'p',
  '[': '^',
  '{': '¨',
  ']': '$',
  '}': '£',
  '\\': '*',
  '|': 'µ',
  a: 'q',
  s: 's',
  d: 'd',
  f: 'f',
  g: 'g',
  h: 'h',
  j: 'j',
  k: 'k',
  l: 'l',
  ';': 'm',
  ':': 'M',
  "'": 'ù',
  '"': '%',
  z: 'w',
  x: 'x',
  c: 'c',
  v: 'v',
  b: 'b',
  n: 'n',
  m: ',',
  M: '?',
  '.': ':',
  '<': '.',
  '>': '/',
  '/': '!',
  '?': '§',
  ',': ';',
  ' ': ' ',
  // TODO: add numbers
};

export const useKeyboardKey = (key: string) => {
  const layout = useConfigmenuStore(s => s.hud.keyboard);
  const keyRef: MutableRefObject<string> = useRef(key);

  useEffect(() => {
    if (QWERTY_TO_AZERTY[key.toLowerCase()] && layout == 'azerty') {
      keyRef.current = QWERTY_TO_AZERTY[key.toLowerCase()];
    } else {
      keyRef.current = key;
    }
  }, [layout]);

  return { key: keyRef.current ?? key };
};
