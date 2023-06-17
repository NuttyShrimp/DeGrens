import { Events, Notifications, RPC, SQL, Util } from '@dgx/server';
import { charModule } from 'helpers/core';

const notePromises: Map<string, PendingNoteShare> = new Map();

const getNotes = async (cid: number): Promise<Note[]> => {
  const result = await SQL.query(
    `
		SELECT pn.id, pn.title, pn.note, pn.date
		FROM phone_notes pn
         INNER JOIN phone_notes_access pna ON pn.id = pna.note_id
		WHERE pna.cid = ?
    `,
    [cid]
  );
  return result ?? [];
};

const getNote = async (id: number): Promise<Note | null> => {
  const result = await SQL.query(
    `
		SELECT id, title, note, date
		FROM phone_notes
		WHERE id = ?
  `,
    [id]
  );
  return result?.[0] ?? null;
};

const addNote = async (cid: number): Promise<Note | undefined> => {
  let query = `
		INSERT INTO phone_notes (title, note, date)
		VALUES (?, ?, ?)
    RETURNING *
  `;
  const result = await SQL.query<Note[]>(query, ['New Note', '', Date.now()]);
  const note = result?.[0];
  if (!note) return;
  await addNoteAccess(cid, note.id, true);
  return note;
};

const addNoteAccess = async (cid: number, id: number, owner: boolean) => {
  await SQL.query(
    `
      INSERT INTO phone_notes_access (note_id, cid, owner)
      VALUES (?, ?, ?)
    `,
    [id, cid, owner]
  );
};

const updateNote = async (cid: number, id: number, note: string, title: string) => {
  const result = await SQL.query(
    `
		UPDATE phone_notes
		SET note = ?, title = ?
		WHERE (SELECT COUNT(*) FROM phone_notes_access WHERE cid = ? AND id = ?) > 0 AND id = ?
  `,
    [note, title, cid, id, id]
  );
  return result.affectedRows > 0;
};

const deleteNote = async (cid: number, id: number) => {
  // if owner, delete note
  // else delete access
  const result = await SQL.query<{ owner: boolean }[]>(
    `
      SELECT owner
      FROM phone_notes_access
      WHERE cid = ? AND note_id = ?
    `,
    [cid, id]
  );
  if (result?.[0]?.owner) {
    await SQL.query(
      `
        DELETE FROM phone_notes
        WHERE id = ?
      `,
      [id]
    );
  } else {
    await SQL.query(
      `
        DELETE FROM phone_notes_access
        WHERE cid = ? AND note_id = ?
      `,
      [cid, id]
    );
  }
};

const getAvailablePromId = () => {
  let id = Util.uuidv4();
  while (notePromises.has(id)) {
    id = Util.uuidv4();
  }
  return id;
};

RPC.register('dg-phone:server:notes:get', async (src: number) => {
  const player = charModule.getPlayer(src);
  if (!player) return;
  return await getNotes(player.citizenid);
});

RPC.register('dg-phone:server:notes:new', async (src: number) => {
  const player = charModule.getPlayer(src);
  if (!player) return;

  const newNote = await addNote(player.citizenid);
  if (!newNote) {
    Notifications.add(src, 'Er is iets fout gelopen bij het opslaan van de notitie', 'error');
    return;
  }
  return newNote;
});

Events.onNet('dg-phone:server:notes:save', async (src, data: Pick<Note, 'id' | 'note' | 'title'>) => {
  const player = charModule.getPlayer(src);
  if (!player) return;
  await updateNote(player.citizenid, data.id, data.note, data.title);
});

Events.onNet('dg-phone:server:notes:delete', async (src, noteId: number) => {
  const player = charModule.getPlayer(src);
  if (!player) return;
  await deleteNote(player.citizenid, noteId);
});

Events.onNet('dg-phone:server:notes:share', async (src: number, noteId: number, shareType: NoteShareType) => {
  const player = charModule.getPlayer(src);
  if (!player) return;
  // get note
  const note = await getNote(noteId);
  if (!note) return;

  const targets = Util.getAllPlayersInRange(src, 5);
  targets.forEach(target => {
    const promiseId = getAvailablePromId();
    notePromises.set(promiseId, {
      id: Util.uuidv4(),
      noteId: note.id,
      origin: player.serverId,
      target,
      type: shareType,
    });
    emitNet('dg-phone:client:notes:share', target, promiseId);
    setTimeout(() => {
      notePromises.delete(promiseId);
    }, 30000);
  });
});

RPC.register('dg-phone:server:notes:resolve', async (src, data: { id: string; accepted: string }) => {
  if (!data.accepted) return;
  const player = charModule.getPlayer(src);
  if (!player) return;
  const promise = notePromises.get(data.id);
  if (!promise) {
    return 'Promise not found';
  }
  const note = await getNote(promise.noteId);
  if (!note) {
    return 'Shared note not found';
  }

  let retval: Note = { ...note };
  if (promise.type == 'permanent') {
    await addNoteAccess(player.citizenid, note.id, false);
    retval.readonly = false;
  } else {
    retval.readonly = true;
  }
  notePromises.delete(data.id);
  return retval;
});
