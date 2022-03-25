import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import URI from 'urijs';

import 'dayjs/locale/nl-be';

export const emptyFn = () => {
  // empty
};

export const copyToClipboard = (msg: string): void => {
  const clipElem = document.createElement('input');
  clipElem.value = msg;
  document.body.appendChild(clipElem);
  clipElem.select();
  document.execCommand('copy');
  document.body.removeChild(clipElem);
};

// https://stackoverflow.com/questions/19395458/check-if-a-link-is-an-image
const isUriImage = (uri: string): boolean => {
  //make sure we remove any nasty GET params
  uri = uri.split('?')[0];
  //moving on, split the uri into parts that had dots before them
  const parts = uri.split('.');
  //get the last part ( should be the extension )
  const extension = parts[parts.length - 1];
  //define some image types to test against
  const imageTypes = ['jpg', 'jpeg', 'tiff', 'png', 'gif', 'bmp'];
  //check if the extension matches anything in the list.
  return imageTypes.indexOf(extension) !== -1;
};

export const checkImageValidity = (url: string): Promise<boolean> => {
  if (!isUriImage(url)) {
    return Promise.resolve(false);
  }
  const image = new Image();
  return new Promise(resolve => {
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = url;
  });
};

export const extractLinks = (text: string): { text: string; links: string[] } => {
  const links: string[] = [];
  URI.withinString(text, (url: string) => {
    if (isUriImage(url)) {
      links.push(url);
      text = text.replace(url, '');
    }
    return text;
  });
  return {
    text: text.trim(),
    links,
  };
};

const IllegalTags = [
  'script',
  'style',
  'iframe',
  'frame',
  'frameset',
  'object',
  'embed',
  'link',
  'embed',
  'meta',
  'head',
  'title',
];

export const sanitizeText = (text: string): string => {
  IllegalTags.forEach(t => {
    text = text.replace(new RegExp(`<${t}\b[^<]*(?:(?!</${t}>)<[^<]*)*</${t}>`, 'gi'), '');
  });
  return text.trim();
};

export const getFirstLine = (text: string): string => {
  // Split on \n & <br>
  const lines = text.split(/\n|<br>/);
  return lines[0];
};

export function uuidv4(): string {
  let uuid = '';
  for (let ii = 0; ii < 32; ii += 1) {
    switch (ii) {
      case 8:
      case 20:
        uuid += '-';
        uuid += ((Math.random() * 16) | 0).toString(16);
        break;
      case 12:
        uuid += '-';
        uuid += '4';
        break;
      case 16:
        uuid += '-';
        uuid += ((Math.random() * 4) | 8).toString(16);
        break;
      default:
        uuid += ((Math.random() * 16) | 0).toString(16);
    }
  }
  return uuid;
}

export const formatRelativeTime = (time: number) => {
  dayjs.extend(relativeTime).locale('nl-be');
  return dayjs(time).fromNow();
};

export const formatTime = (time: number): string => {
  const sec = Math.floor(time % 60);
  const min = Math.floor(time / 60);
  return `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
};

export const hexToRGB = (hex: string, alpha = 1): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
