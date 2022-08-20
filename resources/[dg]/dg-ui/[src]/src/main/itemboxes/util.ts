const images = import.meta.globEager('../../assets/inventory/*.png');

export const getImg = (name: string) => {
  if (!name) name = 'noicon.png';
  const path = `../../assets/inventory/${name}`;
  const img = images[path]?.default ?? getImg('noicon.png');
  return img;
};
