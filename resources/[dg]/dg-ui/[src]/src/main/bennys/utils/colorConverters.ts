export const round = (number: number, digits = 0, base = Math.pow(10, digits)): number => {
  return Math.round(base * number) / base;
};

// https://github.com/omgovich/react-colorful/blob/a85e5b36b55cae7e95c73c8ecde0bc881e8e3b1f/src/utils/convert.ts#L170
export const rgbToHsv = ({ r, g, b }: RGB): Bennys.RGBSliders.HSVColor => {
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);

  // prettier-ignore
  const hh = delta
    ? max === r
      ? (g - b) / delta
      : max === g
        ? 2 + (b - r) / delta
        : 4 + (r - g) / delta
    : 0;

  return {
    h: round(60 * (hh < 0 ? hh + 6 : hh)),
    s: round(max ? (delta / max) * 100 : 0),
    v: round((max / 255) * 100),
  };
};

export const hsvToRgb = ({ h, s, v }: Bennys.RGBSliders.HSVColor): RGB => {
  h = (h / 360) * 6;
  s = s / 100;
  v = v / 100;

  const hh = Math.floor(h),
    b = v * (1 - s),
    c = v * (1 - (h - hh) * s),
    d = v * (1 - (1 - h + hh) * s),
    module = hh % 6;

  return {
    r: round([v, c, b, b, d, v][module] * 255),
    g: round([d, v, v, c, b, b][module] * 255),
    b: round([b, b, d, v, v, c][module] * 255),
  };
};

export const hsvToRgbString = ({ h, s, v }: Bennys.RGBSliders.HSVColor): string => {
  const rgb = hsvToRgb({ h, s, v });
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
};

export const hsvToHsl = ({ h, s, v }: Bennys.RGBSliders.HSVColor): Bennys.RGBSliders.HSLColor => {
  const hh = ((200 - s) * v) / 100;

  return {
    h: round(h),
    s: round(hh > 0 && hh < 200 ? ((s * v) / 100 / (hh <= 100 ? hh : 200 - hh)) * 100 : 0),
    l: round(hh / 2),
  };
};

export const hsvToHslString = ({ h, s, v }: Bennys.RGBSliders.HSVColor): string => {
  const hsl = hsvToHsl({ h, s, v });
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
};
