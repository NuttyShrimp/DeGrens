const images = import.meta.glob('../../assets/inventory/*.png', { eager: true });

export const getImg = (name: string) => {
  if (!name) name = 'noicon.png';
  const path = `../../assets/inventory/${name}`;
  return (images[path] as any)?.default ?? getImg('noicon.png');
};
