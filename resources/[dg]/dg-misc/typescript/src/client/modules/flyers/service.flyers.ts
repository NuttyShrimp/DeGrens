import { Events, UI } from '@dgx/client';

export const openCreationMenu = async () => {
  const fields = await UI.openInput({
    header: 'Create a flyer',
    inputs: [
      {
        name: 'image',
        type: 'text',
        label: 'Image link',
      },
      {
        name: 'info',
        type: 'display',
        label: 'Disclaimer',
        value:
          'This item will go trough validation before being created. You will receive a mail when you can come pick up your flyers',
      },
    ],
  });

  if (!fields.accepted) {
    return;
  }

  Events.emitNet('misc:flyers:requestFlyer', fields.values.image);
};

export const openList = async () => {};
