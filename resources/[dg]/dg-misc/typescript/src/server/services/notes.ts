import { Core, Events, Inventory, Notifications, Util } from '@dgx/server';
import { Vector3 } from '@dgx/shared';

const notes: Record<number, Notes.Note> = {};
let noteId = 0;

Core.onPlayerLoaded(ply => {
  if (!ply.serverId) return;
  Events.emitNet('misc:notes:sync', ply.serverId, Object.values(notes));
});

Events.onNet('misc:notes:edit', (src: number, id: number, content: string) => {
  const coords = Util.getPlyCoords(src);
  if (!id) {
    createNote(src, content, coords);
  } else {
    updateNote(src, id, content);
  }
});

Events.onNet('misc:notes:delete', (src: number, id: number) => {
  const note = notes[id];
  if (!note) return;
  Util.Log(
    'notes:delete',
    {
      note,
    },
    `${Util.getIdentifier(src)} has deleted note with id: ${id}`,
    src
  );
  delete notes[id];
  Events.emitNet('misc:notes:delete', -1, id);
});

const updateNote = (src: number, id: number, content: string) => {
  const cid = Util.getCID(src);
  const note = notes[id];
  if (!note) return;
  Util.Log(
    'notes:update',
    {
      note,
      newContent: content,
    },
    `${Util.getIdentifier(src)} has updated a note`,
    src
  );
  note.last_editor = cid;
  note.note = content;
  Events.emitNet('misc:notes:sync', -1, [note]);
};

const createNote = (src: number, content: string, coords: Vec3) => {
  const coordsVec = Vector3.clone(coords);
  const nearNote = Object.values(notes).find(n => coordsVec.distance(n.coords) < 0.4);
  if (nearNote) {
    Notifications.add(src, 'Er ligt al een notitie in de buurt', 'error');
    return;
  }
  const id = ++noteId;
  const cid = Util.getCID(src);
  const note: Notes.Note = {
    id,
    creator: cid,
    last_editor: cid,
    note: content,
    coords,
  };
  notes[note.id] = note;
  Util.Log(
    'notes:create',
    {
      note,
    },
    `${Util.getIdentifier(src)} has created a note`,
    src
  );
  Events.emitNet('misc:notes:sync', -1, [note]);
};

Inventory.registerUseable('notepad', async src => {
  Events.emitNet('misc:notes:edit', src, undefined);
});
