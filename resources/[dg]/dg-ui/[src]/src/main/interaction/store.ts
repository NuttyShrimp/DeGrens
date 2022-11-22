import { StoreObject } from '@lib/redux';

const store: StoreObject<Interaction.State> = {
  key: 'interaction',
  initialState: {
    visible: true,
    show: false,
    text: '',
    type: 'info',
  },
};
export default store;
