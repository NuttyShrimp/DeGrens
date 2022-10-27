import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { baseStyle } from '@src/base.styles';
import AppWrapper, { closeApplication } from '@src/components/appwrapper';
import { nuiAction } from '@src/lib/nui-comms';

import { OrderGame } from './components/games/ordergame';
import { SequenceGame } from './components/games/sequencegame';
import { VisionGame } from './components/games/visiongame';
import { InfoDisplay } from './components/infodisplay';
import { useGrid } from './hooks/usegrid';
import store from './store';

import './styles/gridgame.scss';

const Component: AppFunction<Gridgame.State> = props => {
  const { setCells } = useGrid();
  const [infoDisplay, setInfoDisplay] = useState<Gridgame.InfoDisplay | null>(null);

  useEffect(() => {
    setCells(() =>
      [...new Array(Math.pow(props.gridSize, 2))].map((_, i) => ({
        id: i,
        active: false,
      }))
    );
  }, [props.gridSize]);

  const handleShow = useCallback((data: Gridgame.GameData & { id: string }) => {
    const { id, game: active, gridSize, ...gameData } = data;
    props.updateState({ visible: true, id, active, gridSize, data: gameData });

    setInfoDisplay({
      text: 'Override Required...',
      color: baseStyle.primaryDarker.dark,
    });
    setTimeout(() => {
      setInfoDisplay(null);
    }, 3000);
  }, []);

  const handleHide = useCallback(() => {
    props.updateState({ ...store.initialState });
  }, []);

  const finishGame = useCallback(
    (success: boolean) => {
      setInfoDisplay({
        text: success ? 'Override Successful...' : 'Override Failed...',
        color: success ? baseStyle.primary.normal : baseStyle.tertiary.dark,
      });
      setTimeout(() => {
        nuiAction('gridgame/finished', { id: props.id, success });
        closeApplication('gridgame');
      }, 3000);
    },
    [closeApplication, props.id]
  );

  const activeGame = useMemo(() => {
    switch (props.active) {
      case 'order':
        return (
          <OrderGame gridSize={props.gridSize} {...(props.data as Gridgame.OrderGameData)} finishGame={finishGame} />
        );
      case 'sequence':
        return (
          <SequenceGame
            gridSize={props.gridSize}
            {...(props.data as Gridgame.SequenceGameData)}
            finishGame={finishGame}
          />
        );
      case 'vision':
        return (
          <VisionGame gridSize={props.gridSize} {...(props.data as Gridgame.VisionGameData)} finishGame={finishGame} />
        );
      default:
        return null;
    }
  }, [props]);

  return (
    <AppWrapper appName={store.key} onShow={handleShow} onHide={handleHide} full center>
      <div className='gridgame'>
        {infoDisplay !== null ? (
          <InfoDisplay size={props.gridSize * 10 + 1} {...infoDisplay}></InfoDisplay>
        ) : (
          activeGame
        )}
      </div>
    </AppWrapper>
  );
};

export default Component;
