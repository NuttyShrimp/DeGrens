export const typeToLabel = (str: string) => {
  const splitStr = str.split('_');
  for (let i = 0; i < splitStr.length; i++) {
    const lowercase = splitStr[i].toLocaleLowerCase();
    const [first, ...rest] = lowercase;
    splitStr[i] = first.toLocaleUpperCase() + rest.join('');
  }
  return splitStr.join(' ');
};
