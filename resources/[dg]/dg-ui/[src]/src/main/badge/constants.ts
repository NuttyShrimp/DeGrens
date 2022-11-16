import policeImage from '@assets/badges/police.png';

export const TYPES: Record<Badge.Type, { image: string; top: number; left: number }> = {
  police: {
    image: policeImage,
    top: 2.5,
    left: 3.1,
  },
};
