import { Events, UI } from '@dgx/client';

Events.onNet('police:plateflags:openAddMenu', async () => {
  const result = await UI.openInput({
    header: 'Flag Nummerplaat',
    inputs: [
      { type: 'text', label: 'Nummerplaat', name: 'plate' },
      { type: 'text', label: 'Reden', name: 'reason' },
      {
        type: 'select',
        label: 'Lengte',
        name: 'hours',
        // values are time in hours
        options: [
          { label: '12 uur', value: '12' },
          { label: '1 dag', value: '24' },
          { label: '2 dagen', value: '48' },
          { label: '3 dagen', value: '72' },
          { label: '1 week', value: '168' },
          { label: '2 weken', value: '336' },
        ],
      },
    ],
  });
  if (!result.accepted) return;

  Events.emitNet('police:plateflags:addFlag', result.values.plate, result.values.reason, Number(result.values.hours));
});

Events.onNet(
  'police:plateflags:openFlagsList',
  (plate: string, flags: (Police.Plateflags.Flag & { issuedByName: string; issuedDateString: string })[]) => {
    const menu: ContextMenu.Entry[] = [
      {
        title: plate,
        disabled: true,
        description: 'Klik op een flag om te verwijderen',
      },
    ];

    flags.forEach(flag => {
      menu.push({
        title: '',
        description: `${flag.reason} - ${flag.issuedByName} - ${flag.issuedDateString}`,
        callbackURL: 'police/plateflags/remove',
        data: {
          id: flag.id,
        },
      });
    });

    UI.openApplication('contextmenu', menu);
  }
);

UI.RegisterUICallback('police/plateflags/remove', (data: { id: string }, cb) => {
  Events.emitNet('police:plateflags:removeFlag', data.id);
  cb({ meta: { message: 'done', ok: true }, data: {} });
});
