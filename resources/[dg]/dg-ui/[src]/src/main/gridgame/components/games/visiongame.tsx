import React, { FC, useCallback, useEffect, useState } from 'react';
import { baseStyle } from '@src/base.styles';

import { generateVisiongame } from '../../helpers/visiongamegenerator';
import { useGrid } from '../../hooks/usegrid';
import { Grid } from '../grid';

export const VisionGame: FC<Gridgame.VisionGameData & Gridgame.GameComponentProps> = props => {
  const { cells, setCellKey, setCells } = useGrid();

  const [puzzle, setPuzzle] = useState<{
    start: {
      id: number;
      type: 'color' | 'active' | 'disabled';
      label: number | undefined;
    }[];
    end: ('color' | 'active')[];
  } | null>(null);

  const [timedOut, setTimedOut] = useState(false);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [checkEnd, setCheckEnd] = useState(false);

  // Initiation
  useEffect(() => {
    const generatedPuzzle = generateVisiongame(props.gridSize) as typeof puzzle;
    if (!generatedPuzzle) return;
    setPuzzle(generatedPuzzle);
  }, []);

  useEffect(() => {
    if (puzzle === null) return;
    setCells(() =>
      puzzle.start.map(c => ({
        id: c.id,
        active: c.type === 'active',
        label: c.label,
        displayLabel: true,
        color: c.type === 'color' ? baseStyle.tertiary.dark : undefined,
        data: { cantClick: c.type === 'color' || c.type === 'active' },
      }))
    );
    setTimeout(() => {
      setTimedOut(true);
    }, props.time * 1000);
  }, [puzzle]);

  useEffect(() => {
    if (!timedOut) return;
    props.finishGame(false);
  }, [timedOut]);

  useEffect(() => {
    if (!checkEnd) return;
    if (!puzzle) return;
    setCheckEnd(false);
    if (cells.some(c => !c.active && !c.color)) return;

    const isCorrect = cells.every((c, i) => {
      const expected = puzzle.end[i];
      if (expected === 'active') {
        return c.active;
      } else if (expected === 'color') {
        return c.color;
      }
    });
    if (!isCorrect) return;
    props.finishGame(true);
  }, [checkEnd]);

  const handleClick = useCallback(
    (cell: Gridgame.Cell) => {
      if (cell.data?.cantClick) return;

      // Cycle colors
      if (cell.active) {
        setCellKey(cell.id, 'active', false);
        setCellKey(cell.id, 'color', baseStyle.tertiary.normal);
      } else if (cell.color) {
        setCellKey(cell.id, 'color', undefined);
      } else {
        setCellKey(cell.id, 'active', true);
      }

      if (clickTimeout !== null) {
        clearTimeout(clickTimeout);
      }
      setClickTimeout(
        setTimeout(() => {
          setClickTimeout(null);
          setCheckEnd(true);
        }, 750)
      );
    },
    [clickTimeout, cells]
  );

  return <Grid onClick={handleClick}></Grid>;
};
