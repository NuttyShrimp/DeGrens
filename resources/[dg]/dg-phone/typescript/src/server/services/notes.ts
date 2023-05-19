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
  return result?.[1] ?? null;
};

const addNote = async (cid: number, title: string, note: string, date: number) => {
  let query = `
		INSERT INTO phone_notes (title, note, date)
		VALUES (?, ?, ?)
  `;
  const insertId = await SQL.insert(query, [title, note, date]);
  if (!insertId) return;
  await addNoteAccess(cid, insertId, true);
  return insertId;
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

RPC.register('dg-phone:server:notes:new', async (src: number, data: Note) => {
  const player = charModule.getPlayer(src);
  if (!player) return;
  const id = await addNote(player.citizenid, data.title, data.note, data.date);
  if (!id) {
    Notifications.add(src, 'Er is iets fout gelopen bij het opslaan van de notitie', 'error');
    return;
  }
  data.id = id;
  return data;
});

Events.onNet('dg-phone:server:notes:save', async (src, data) => {
  const player = charModule.getPlayer(src);
  if (!player) return;
  await updateNote(player.citizenid, data.id, data.note, data.title);
});

Events.onNet('dg-phone:server:notes:delete', async (src, data) => {
  const player = charModule.getPlayer(src);
  if (!player) return;
  await deleteNote(player.citizenid, data.id);
});

Events.onNet('dg-phone:server:notes:share', async (src: number, data: { id: number; type: 'local' | 'permanent' }) => {
  const player = charModule.getPlayer(src);
  if (!player) return;
  // get note
  const note = await getNote(data.id);
  if (!note) return;

  const targets = Util.getAllPlayersInRange(src, 5);
  targets.forEach(target => {
    if (target == src) return;
    const promiseId = getAvailablePromId();
    notePromises.set(promiseId, {
      id: Util.uuidv4(),
      noteId: note.id,
      origin: player.serverId,
      target,
      type: data.type,
    });
    note.readonly = data.type == 'local';
    emitNet('dg-phone:client:notes:share', target, note, promiseId);
    setTimeout(() => {
      notePromises.delete(promiseId);
    }, 30000);
  });
});

RPC.register('dg-phone:server:notes:resolve', async (src, data: { id: string; accepted: string }) => {
  const promise = notePromises.get(data.id);
  if (!promise) {
    return 'Promise not found';
  }
  let retval: number | undefined = undefined;
  if (data.accepted && promise.type == 'permanent') {
    const player = charModule.getPlayer(src);
    if (!player) return;
    const note = await getNote(promise.noteId);
    if (!note) {
      return 'Shared note not found';
    }
    await addNoteAccess(player.citizenid, note.id, false);
    retval = note.id;
  }
  notePromises.delete(data.id);
  return retval;
});
