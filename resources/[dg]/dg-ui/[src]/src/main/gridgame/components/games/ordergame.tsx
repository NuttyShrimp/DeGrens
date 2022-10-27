import React, { FC, useCallback, useEffect, useState } from 'react';

import { useGrid } from '../../hooks/usegrid';
import { Grid } from '../grid';

export const OrderGame: FC<Gridgame.OrderGameData & Gridgame.GameComponentProps> = props => {
  const { setCells, setLabelsVisible, setCellKey } = useGrid();
  const [sequence, setSequence] = useState<number[]>([]);
  const [cycle, setCycle] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'display' | 'input' | null>(null);
  const [failed, setFailed] = useState<boolean>(false);

  // Value is cycle that you timed out
  const [timedOut, setTimedOut] = useState<number>();

  const generateSequence = () => {
    const max = Math.pow(props.gridSize, 2);
    const seq: number[] = [];
    while (seq.length < props.length) {
      const r = Math.floor(Math.random() * max);
      if (seq.includes(r)) continue;
      seq.push(r);
    }
    return seq;
  };

  // Handles different phases
  useEffect(() => {
    if (currentPhase === 'display') {
      const seq = generateSequence();
      setSequence(seq);

      setCells(() =>
        [...new Array(Math.pow(props.gridSize, 2))].map((_, i) => {
          const seqIndex = seq.indexOf(i);
          const inSeq = seqIndex !== -1;
          return {
            id: i,
            active: inSeq,
            label: seqIndex + 1,
            displayLabel: inSeq,
          };
        })
      );

      setTimeout(() => {
        setCurrentPhase('input');
      }, props.displayTime * 1000);
      return;
    }

    if (currentPhase === 'input') {
      setLabelsVisible(false);
      setTimeout(() => {
        setTimedOut(cycle);
      }, props.inputTime * 1000);
      return;
    }
  }, [currentPhase]);

  // Handles input phase timeout
  useEffect(() => {
    // check if still in cycle the timeout was started
    if (timedOut !== cycle) return;
    setFailed(true);
  }, [timedOut]);

  // Handles cycle changes
  useEffect(() => {
    if (cycle !== props.amount) {
      setCurrentPhase('display');
      return;
    }

    setCurrentPhase(null);
    props.finishGame(true);
  }, [cycle]);

  // Handles failing
  useEffect(() => {
    if (!failed) return;
    setCurrentPhase(null);
    props.finishGame(false);
  }, [failed]);

  const handleClick = useCallback(
    (cell: Gridgame.Cell) => {
      if (currentPhase !== 'input') return;
      if (!cell.active) return;

      // Check if not correct in sequence
      if (sequence[0] !== cell.id) {
        setFailed(true);
        return;
      }

      setSequence(seq => seq.filter((_, i) => i !== 0));
      setCellKey(cell.id, 'active', false);

      // Check if last cell active
      if (sequence.length === 1) {
        setCycle(c => c + 1);
      }
    },
    [currentPhase, sequence]
  );

  return <Grid onClick={handleClick}></Grid>;
};
