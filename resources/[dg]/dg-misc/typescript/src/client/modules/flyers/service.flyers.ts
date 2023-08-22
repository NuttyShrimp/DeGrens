import { Events, Notifications, UI } from '@dgx/client';

export const openCreationMenu = async () => {
  const fields = await UI.openInput<{ image: string; description: string }>({
    header: 'Create a flyer',
    inputs: [
      {
        name: 'image',
        type: 'text',
        label: 'Image link',
      },
      {
        name: 'description',
        type: 'text',
        label: 'Flyer description (required)',
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

  if (!fields.accepted) return;
  if (!fields.values?.image?.length || !fields.values?.description?.length) {
    Notifications.add('Je hebt niet alle velden ingevuld', 'error');
    return;
  }

  Events.emitNet('misc:flyers:requestFlyer', fields.values.image, fields.values.description);
};
