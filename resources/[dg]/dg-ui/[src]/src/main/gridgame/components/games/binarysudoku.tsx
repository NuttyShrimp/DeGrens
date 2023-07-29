import { FC, useCallback, useEffect, useState } from 'react';
import { baseStyle } from '@src/base.styles';

import { generateBinarySudoku } from '../../helpers/binarysudokugenerator';
import { useGrid } from '../../hooks/usegrid';
import { Grid } from '../grid';

const getColorFromValue = (value: 0 | 1 | 2) => {
  if (value === 0) return undefined;
  if (value === 1) return baseStyle.primary.normal;
  if (value === 2) return baseStyle.secondary.normal;
};

export const BinarySudoku: FC<Gridgame.VisionGameData & Gridgame.GameComponentProps> = props => {
  const { cells, setCellKey, setCells } = useGrid();

  const [puzzle, setPuzzle] = useState<{
    start: (0 | 1 | 2)[];
    end: (0 | 1 | 2)[];
  } | null>(null);

  const [timedOut, setTimedOut] = useState(false);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [checkEnd, setCheckEnd] = useState(false);

  // Initiation
  useEffect(() => {
    if (props.gridSize % 2 !== 0) {
      throw new Error('BinarySudoku gridsize must be even');
    }

    const generatedPuzzle = generateBinarySudoku(props.gridSize) as typeof puzzle;
    if (!generatedPuzzle) return;
    setPuzzle(generatedPuzzle);
  }, []);

  useEffect(() => {
    if (puzzle === null) return;
    setCells(() =>
      puzzle.start.map((val, idx) => ({
        id: idx,
        active: false,
        displayLabel: true,
        color: getColorFromValue(val),
        data: { cantClick: val !== 0, value: val },
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
    if (cells.some(c => !c.color)) return;

    const isCorrect = cells.every((c, i) => {
      const expected = puzzle.end[i];
      return expected === c.data?.value;
    });
    if (!isCorrect) return;

    props.finishGame(true);
  }, [checkEnd]);

  const handleClick = useCallback(
    (cell: Gridgame.Cell) => {
      if (cell.data?.cantClick) return;

      // Cycle colors
      const newValue = (((cell.data?.value ?? 0) + 1) % 3) as 0 | 1 | 2;
      setCellKey(cell.id, 'data', { value: newValue });
      setCellKey(cell.id, 'color', getColorFromValue(newValue));

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
