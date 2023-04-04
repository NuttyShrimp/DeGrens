import React, { FC } from 'react';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { Divider, Tooltip } from '@mui/material';

const CONTROLS: { action: string; description: string }[] = [
  {
    action: 'Hover over item + LMB',
    description: 'verplaatsen van het item waar je cursor opstaat',
  },
  {
    action: 'Hover over item + RMB',
    description: 'verplaats het item waar je cursor opstaat of de geselecteerde items snel naar de andere kant',
  },
  {
    action: 'Dragging item + R',
    description: 'draai het item dat je aan het verplaatsen bent',
  },
  {
    action: 'Hover over item + 2x LMB',
    description: 'gebruik het item waar je cursor op staat',
  },
  {
    action: 'Hover over item + 1-5',
    description: 'keybind het item waar je cursor op staat',
  },
  {
    action: 'Hold ctrl + Hover over item',
    description: 'selecteer de items waar je cursor overgaat',
  },
];

export const HelpTooltip: FC = () => {
  return (
    <Tooltip
      classes={{ tooltip: 'inventory__tooltip' }}
      disableInteractive
      title={
        <>
          <b className='label'>Controls:</b>
          <br />
          <ul className='description'>
            {CONTROLS.map((c, idx) => (
              <>
                <Divider />
                <li key={idx}>
                  <em>{c.action}</em>
                  {`: ${c.description}`}
                </li>
              </>
            ))}
          </ul>
        </>
      }
      placement='top'
    >
      <QuestionMarkIcon fontSize='large' />
    </Tooltip>
  );
};
