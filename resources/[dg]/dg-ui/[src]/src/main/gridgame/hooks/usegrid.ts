import { useCallback } from 'react';

import { useGridGameStore } from '../stores/useGridGameStore';

export const useGrid = () => {
  const [gridSize, cells, setStoreCells] = useGridGameStore(s => [s.gridSize, s.cells, s.setCells]);

  const setCells = useCallback((cb: (oldCells: Gridgame.Cell[]) => Gridgame.Cell[]) => {
    setStoreCells(cb(cells).sort((c1, c2) => c1.id - c2.id));
  }, []);

  const setLabelsVisible = useCallback((displayLabel: boolean) => {
    setCells(oldCells => oldCells.map(c => ({ ...c, displayLabel })));
  }, []);

  const setCellKey = useCallback((cellId: number, key: keyof Gridgame.Cell, value: Gridgame.Cell[typeof key]) => {
    setCells(oldCells => oldCells.map(c => ({ ...c, [key]: c.id === cellId ? value : c[key] })));
  }, []);

  return {
    cells,
    gridSize,
    setCells,
    setLabelsVisible,
    setCellKey,
  };
};
