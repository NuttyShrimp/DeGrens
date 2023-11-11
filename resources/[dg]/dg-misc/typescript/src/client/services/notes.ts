import { Animations, Events, Keys, UI, Util } from '@dgx/client';
import { Thread } from '@dgx/shared';

import { getChunkForPos } from '../../shared/helpers/grid';

const notes: Record<number, Notes.Note & { chunk: number }> = {};
const chunkToNotes: Record<number, Set<number>> = {};
let animLoopId: number = 0;

const noteInteractionThread = new Thread(
  function () {
    if (!this.data.chunk) return;
    const hadSelected = this.data.selectedNote !== undefined;
    this.data.selectedNote = undefined;
    const pos = Util.getPlyCoords();
    const chunkNotes = chunkToNotes[this.data.chunk];
    if (!chunkNotes) return;
    chunkNotes.forEach(id => {
      const note = notes[id];
      DrawMarker(
        27,
        note.coords.x / 1.0,
        note.coords.y / 1.0,
        note.coords.z - 0.75,
        0.0,
        0.0,
        0.0,
        180.0,
        0.0,
        0.0,
        0.3,
        0.3,
        0.3,
        128,
        170,
        255,
        150,
        false,
        true,
        2,
        false,
        // @ts-ignore
        undefined,
        // @ts-ignore
        undefined,
        false
      );
      if (pos.distance(note.coords) < 1.5) {
        this.data.selectedNote = note.id;
        UI.showInteraction(
          `[${Keys.getBindedKey('+GeneralUse')}] - Edit | [${Keys.getBindedKey('housingMain')}] - Delete`
        );
      }
    });
    if (!this.data.selectedNote && hadSelected) {
      UI.hideInteraction();
    }
  },
  0,
  'tick'
);

setImmediate(() => {
  const thread = Util.gridThreadGenerator(1000, 256, chunkId => {
    console.log(`Thread to: ${chunkId}`);
    noteInteractionThread.data.chunk = chunkId;
  });
  thread.start();
  noteInteractionThread.data.chunk = Util.getChunkForPos(Util.getPlyCoords(), 256);
  noteInteractionThread.start();
});

UI.RegisterUICallback('notes/save', (data: { note: string; id: number }, cb) => {
  Events.emitNet('misc:notes:edit', data.id, data.note);
  UI.closeApplication('notes');
  Animations.stopAnimLoop(animLoopId);
  animLoopId = 0;
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

Events.onNet('misc:notes:edit', () => {
  UI.openApplication('notes', {});
  if (animLoopId) return;
  animLoopId = Animations.startAnimLoop({
    weight: 5,
    animation: {
      dict: 'missheistdockssetup1clipboard@base',
      flag: 16,
      name: 'base',
    },
  });
});

Events.onNet('misc:notes:sync', (newNotes: Notes.Note[]) => {
  newNotes.forEach(n => {
    const chunk = getChunkForPos(n.coords, 256);
    if (notes[n.id]) {
      if (chunkToNotes[notes[n.id].chunk]) {
        chunkToNotes[notes[n.id].chunk].delete(n.id);
      }
    }
    notes[n.id] = { ...n, chunk };
    if (!chunkToNotes[chunk]) {
      chunkToNotes[chunk] = new Set();
    }
    chunkToNotes[chunk].add(n.id);
  });
});

Events.onNet('misc:notes:delete', (id: number) => {
  const note = notes[id];
  if (!note) return;
  console.log(note.chunk);
  chunkToNotes[note.chunk].delete(id);
  delete notes[id];
});

Keys.onPressDown('GeneralUse', () => {
  const noteId = noteInteractionThread.data.selectedNote;
  if (!noteId) return;
  const note = notes[noteId];
  if (!note) return;
  UI.openApplication('notes', {
    note: note.note,
    id: note.id,
  });
  if (animLoopId) return;
  animLoopId = Animations.startAnimLoop({
    weight: 5,
    animation: {
      dict: 'missheistdockssetup1clipboard@base',
      flag: 16,
      name: 'base',
    },
  });
});

Keys.onPressDown('housingMain', () => {
  const noteId = noteInteractionThread.data.selectedNote;
  if (!noteId) return;
  const note = notes[noteId];
  if (!note) return;
  Events.emitNet('misc:notes:delete', note.id);
});

UI.onApplicationClose(app => {
  if (app !== 'notes' || !animLoopId) return;
  Animations.stopAnimLoop(animLoopId);
  animLoopId = 0;
});
