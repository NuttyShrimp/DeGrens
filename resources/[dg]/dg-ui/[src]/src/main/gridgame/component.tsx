import { useCallback, useEffect, useMemo, useState } from 'react';
import { baseStyle } from '@src/base.styles';
import AppWrapper, { closeApplication } from '@src/components/appwrapper';
import { nuiAction } from '@src/lib/nui-comms';

import { BinarySudoku } from './components/games/binarysudoku';
import { OrderGame } from './components/games/ordergame';
import { SequenceGame } from './components/games/sequencegame';
import { VisionGame } from './components/games/visiongame';
import { InfoDisplay } from './components/infodisplay';
import { useGrid } from './hooks/usegrid';
import { useGridGameStore } from './stores/useGridGameStore';
import config from './_config';

import './styles/gridgame.scss';

const Component: AppFunction = props => {
  const { setCells } = useGrid();
  const [infoDisplay, setInfoDisplay] = useState<Gridgame.InfoDisplay | null>(null);
  const [startGame, resetGame, id, active, data, gridSize] = useGridGameStore(s => [
    s.startGame,
    s.resetGame,
    s.id,
    s.active,
    s.data,
    s.gridSize,
  ]);

  useEffect(() => {
    setCells(() =>
      [...new Array(Math.pow(gridSize, 2))].map((_, i) => ({
        id: i,
        active: false,
      }))
    );
  }, [gridSize]);

  const handleShow = useCallback((data: Gridgame.GameData & { id: string }) => {
    const { id, game: active, gridSize, ...gameData } = data;
    props.showApp();
    startGame(id, active, gridSize, gameData);

    setInfoDisplay({
      text: 'Override Required...',
      color: baseStyle.primaryDarker.dark,
    });
    setTimeout(() => {
      setInfoDisplay(null);
    }, 3000);
  }, []);

  const handleHide = useCallback(() => {
    props.hideApp();
    resetGame();
  }, []);

  const finishGame = useCallback(
    (success: boolean) => {
      setInfoDisplay({
        text: success ? 'Override Successful...' : 'Override Failed...',
        color: success ? baseStyle.primary.normal : baseStyle.tertiary.dark,
      });
      setTimeout(() => {
        nuiAction('gridgame/finished', { id, success });
        closeApplication('gridgame');
      }, 3000);
    },
    [closeApplication, id]
  );

  const activeGame = useMemo(() => {
    switch (active) {
      case 'order':
        return <OrderGame gridSize={gridSize} {...(data as Gridgame.OrderGameData)} finishGame={finishGame} />;
      case 'sequence':
        return <SequenceGame gridSize={gridSize} {...(data as Gridgame.SequenceGameData)} finishGame={finishGame} />;
      case 'vision':
        return <VisionGame gridSize={gridSize} {...(data as Gridgame.VisionGameData)} finishGame={finishGame} />;
      case 'binarysudoku':
        return <BinarySudoku gridSize={gridSize} {...(data as Gridgame.VisionGameData)} finishGame={finishGame} />;
      default:
        return null;
    }
  }, [active]);

  const handleEscape = useCallback(() => {
    if (infoDisplay !== null) return;
    finishGame(false);
    return false; // Prevents the app from closing
  }, [infoDisplay]);

  return (
    <AppWrapper appName={config.name} onShow={handleShow} onHide={handleHide} full center onEscape={handleEscape}>
      <div className='gridgame'>
        {infoDisplay !== null ? <InfoDisplay size={gridSize * 10 + 1} {...infoDisplay}></InfoDisplay> : activeGame}
      </div>
    </AppWrapper>
  );
};

export default Component;
