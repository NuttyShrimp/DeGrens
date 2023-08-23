import { FC, useCallback, useEffect, useState } from 'react';

import { useGrid } from '../../hooks/usegrid';
import { Grid } from '../grid';

export const SequenceGame: FC<Gridgame.SequenceGameData & Gridgame.GameComponentProps> = props => {
  const { setCellKey } = useGrid();
  const [sequence, setSequence] = useState<number[]>([]);
  const [displaySequenceItem, setDisplaySequenceItem] = useState<number | null>(null);

  const [timedOut, setTimedOut] = useState(false);

  // Never two same after eachother
  const generateSequence = () => {
    const max = Math.pow(props.gridSize, 2);
    const seq: number[] = [];
    while (seq.length < props.length) {
      const r = Math.floor(Math.random() * max);
      if (seq[seq.length - 1] === r) continue;
      seq.push(r);
    }
    return seq;
  };

  // Initiation
  useEffect(() => {
    setSequence(generateSequence());
    setDisplaySequenceItem(0);
  }, []);

  // Handles displaying sequence at start
  useEffect(() => {
    if (displaySequenceItem === null) return;
    setCellKey(sequence[displaySequenceItem], 'active', true);

    const showNext = displaySequenceItem !== props.length - 1;

    const timeout = setTimeout(() => {
      setCellKey(sequence[displaySequenceItem], 'active', false);
      if (showNext) {
        setDisplaySequenceItem(displaySequenceItem + 1);
      } else {
        setDisplaySequenceItem(null);
        setTimeout(() => {
          setTimedOut(true);
        }, props.inputTime * 1000);
      }
    }, 750);
    return () => {
      clearTimeout(timeout);
    };
  }, [displaySequenceItem]);

  useEffect(() => {
    if (!timedOut) return;
    props.finishGame(false);
  }, [timedOut]);

  const handleClick = useCallback(
    (cell: Gridgame.Cell) => {
      if (displaySequenceItem !== null) return;

      setCellKey(cell.id, 'active', true);
      setTimeout(() => {
        setCellKey(cell.id, 'active', false);
      }, 200);

      // Check if not correct in sequence
      if (sequence[0] !== cell.id) {
        props.finishGame(false);
        return;
      }

      setSequence(seq => seq.filter((_, i) => i !== 0));

      // Check if last cell active
      if (sequence.length === 1) {
        props.finishGame(true);
      }
    },
    [displaySequenceItem, sequence]
  );

  return <Grid onClick={handleClick}></Grid>;
};
