import { Events, Notifications, UI, Util } from '@dgx/client';

Events.onNet('phone:mails:add', (mail: Phone.Mails.Mail | Phone.Mails.Mail[], skipNotification?: boolean) => {
  UI.SendAppEvent('phone', {
    appName: 'mail',
    action: 'addMail',
    data: { mail, skipNotification },
  });

  if (!Array.isArray(mail) && mail.coords && mail.instantlySetLocation) {
    Util.setWaypoint(mail.coords);
  }
});

UI.RegisterUICallback('phone/mails/remove', (data: { id: string }, cb) => {
  Events.emitNet('phone:mails:remove', data.id);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/mails/setLocation', (data: { coords: Vec3 }, cb) => {
  Util.setWaypoint(data.coords);
  Notifications.add('Locatie is aangeduid op je GPS');
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});
