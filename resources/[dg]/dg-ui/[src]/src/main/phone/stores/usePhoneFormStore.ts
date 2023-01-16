import { create } from '@src/lib/store';

export const usePhoneFormStore = create<Phone.FormState>('phone.form')(() => ({
  visible: false,
  element: null,
  checkmark: false,
  warning: false,
}));
