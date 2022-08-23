export function isKeyOfObject<T>(key: string | number | symbol, obj: T): key is keyof T {
  return key in obj;
}

export const copyToClipboard = (msg: string): void => {
  const clipElem = document.createElement('input');
  clipElem.value = msg;
  document.body.appendChild(clipElem);
  clipElem.select();
  document.execCommand('copy');
  document.body.removeChild(clipElem);
};
