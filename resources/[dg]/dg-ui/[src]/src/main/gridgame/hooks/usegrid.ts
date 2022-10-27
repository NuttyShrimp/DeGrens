import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useUpdateState } from '@src/lib/redux';

export const useGrid = () => {
  const gridSize = useSelector<RootState, number>(state => state.gridgame.gridSize);
  const cells = useSelector<RootState, Gridgame.Cell[]>(state => state.gridgame.cells);
  const updateState = useUpdateState('gridgame');

  const setCells = useCallback((cb: (oldCells: Gridgame.Cell[]) => Gridgame.Cell[]) => {
    updateState(state => ({ cells: cb(state.gridgame.cells).sort((c1, c2) => c1.id - c2.id) }));
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
