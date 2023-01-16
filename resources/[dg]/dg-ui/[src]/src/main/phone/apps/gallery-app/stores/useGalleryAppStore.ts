import { create } from '@src/lib/store';

export const useGalleryAppStore = create<Phone.Gallery.State>('phone.app.gallery')(set => ({
  list: [],
  setList: l => set(() => ({ list: l })),
}));
