import { Chat, Events, Jobs, Notifications, RPC, SQL, Util, Vehicles, UI } from '@dgx/server';
import { mainLogger } from 'sv_logger';

const plateFlags: Police.Plateflags.Flag[] = [];

const plateflagsLogger = mainLogger.child({ module: 'Plate Flags' });

export const loadAllFlaggedPlates = async () => {
  const time = Math.round(Date.now() / 1000);
  const { affectedRows } = (await SQL.query(`DELETE FROM plate_flags WHERE expiration_date < ?`, [time])) as {
    affectedRows: number;
  };

  const result = await SQL.query<
    { id: string; plate: string; reason: string; issued_by: number; issued_date: number }[]
  >('SELECT * FROM plate_flags');

  result.forEach(flag => {
    plateFlags.push({
      id: flag.id,
      plate: flag.plate,
      issuedBy: flag.issued_by,
      reason: flag.reason,
      issuedDate: flag.issued_date,
    });
  });
  plateflagsLogger.silly(`${plateFlags.length} flags have been loaded. ${affectedRows} flags have expired`);
};

// TODO LTS: Move to ANG. This is temp solution for launch
Chat.registerCommand('flagplate', 'Plaats een flag op een nummerplaat', [], 'user', src => {
  if (Jobs.getCurrentJob(src) !== 'police') {
    Chat.sendMessage(src, {
      type: 'system',
      message: `Dit is enkel voor overheidsdiensten`,
      prefix: '',
    });
    return;
  }

  Events.emitNet('police:plateflags:openAddMenu', src);
});

Chat.registerCommand(
  'showplateflags',
  'Toon alle flags op een nummerplaat',
  [{ description: 'Nummerplaat', name: 'plate' }],
  'user',
  async (src, _, args) => {
    if (Jobs.getCurrentJob(src) !== 'police') {
      Chat.sendMessage(src, {
        type: 'system',
        message: `Dit is enkel voor overheidsdiensten`,
        prefix: '',
      });
      return;
    }

    const plate = args[0];

    const menu: ContextMenu.Entry[] = [
      {
        title: plate,
        disabled: true,
        description: 'Klik op een flag om te verwijderen',
      },
    ];

    for (const flag of plateFlags) {
      if (flag.plate !== plate) continue;

      const date = new Date(flag.issuedDate * 1000);
      const issuedDate = `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`;
      const issuedByName = await Util.getCharName(flag.issuedBy);

      menu.push({
        title: '',
        description: `${flag.reason} - ${issuedByName} - ${issuedDate}`,
        callbackURL: 'police/plateflags/remove',
        data: {
          id: flag.id,
        },
      });
    }

    UI.openContextMenu(src, menu);
  }
);

Events.onNet('police:plateflags:addFlag', (src: number, plate: string, reason: string, hours: number) => {
  if (Jobs.getCurrentJob(src) !== 'police') {
    plateflagsLogger.warn(`Player ${src} tried to add plateflag but is not onduty police`);
    return;
  }
  const cid = Util.getCID(src);
  const id = Util.uuidv4();
  const currentDate = Math.round(Date.now() / 1000);
  plateFlags.push({
    id,
    plate,
    reason,
    issuedBy: cid,
    issuedDate: currentDate,
  });
  if (Vehicles.isPlayerPlate(plate)) {
    const expirationDate = currentDate + hours * 60 * 60;
    SQL.insertValues(`plate_flags`, [
      { id, plate, reason, issued_by: cid, issued_date: currentDate, expiration_date: expirationDate },
    ]);
  }
  plateflagsLogger.silly(`Player ${src} has added flag to ${plate}`);
  Util.Log(
    'police:plateflags:add',
    {
      id,
      plate,
      reason,
      issuedBy: cid,
    },
    `${Util.getName(src)} added flag to plate ${plate}`,
    src
  );
});

Events.onNet('police:plateflags:removeFlag', (src: number, id: string) => {
  if (Jobs.getCurrentJob(src) !== 'police') {
    plateflagsLogger.warn(`Player ${src} tried to remove plateflag but is not onduty police`);
    return;
  }

  const idx = plateFlags.findIndex(flag => flag.id === id);
  if (idx === -1) {
    Notifications.add(src, 'Geen flag gevonden om te verwijderen');
    return;
  }

  const oldFlag = plateFlags[idx];
  plateFlags.splice(idx, 1);
  SQL.query(`DELETE FROM plate_flags WHERE id = ?`, [id]);
  plateflagsLogger.silly(`Player ${src} has removed flag ${id} from plate ${oldFlag.plate}`);
  Util.Log(
    'police:plateflags:remove',
    { ...oldFlag },
    `${Util.getName(src)} removed flag from plate ${oldFlag.plate}`,
    src
  );
});

export const isPlateFlagged = (plate: string) => {
  return plateFlags.some(f => f.plate === plate);
};

RPC.register('police:plateflags:isFlagged', (src, plate: string) => {
  return isPlateFlagged(plate);
});
