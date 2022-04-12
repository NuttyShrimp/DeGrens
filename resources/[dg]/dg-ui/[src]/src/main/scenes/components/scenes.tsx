import React, { FC, MouseEvent, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button } from '@components/button';
import { Input } from '@components/inputs';
import FormatSize from '@mui/icons-material/FormatSize';
import Straighten from '@mui/icons-material/Straighten';
import { Button as MUIButton, Grid, Paper, Slider } from '@mui/material';
import { baseStyle } from '@src/base.styles';
import { nuiAction } from '@src/lib/nui-comms';

const fontOptions = [
  {
    value: '0',
    label: 'Normaal',
  },
  {
    value: '1',
    label: 'Cursief',
  },
  {
    value: '2',
    label: 'Normaal 2',
  },
  {
    value: '4',
    label: 'Normaal 3',
  },
  {
    value: '7',
    label: 'Vet',
  },
];

export const Scenes: FC<Scenes.Props> = () => {
  const [text, setText] = useState<string>('');
  const [style, setStyle] = useState<string>('0');
  const [size, setSize] = useState<number>(1);
  const [distance, setDistance] = useState<number>(10);
  const [color, setColor] = useState('#fff');

  const handleCreate = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    nuiAction('scenes:create', {
      text,
      style: Number(style),
      size,
      distance,
      color,
    });
  };

  const handleDelete = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    nuiAction('scenes:delete');
  };

  const handleReset = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setText('');
    setStyle('0');
    setSize(1);
    setDistance(10);
    setColor('#fff');
  };

  return (
    <Paper
      sx={{
        background: baseStyle.primaryDarker.darker,
      }}
      className='menu-box'
    >
      <Grid container spacing={1} direction={'column'}>
        <Grid item>
          <Input.TextField label={'Tekst'} value={text} onChange={setText} icon={'text'} required />
        </Grid>
        <Grid item>
          <Input.AutoComplete
            label={'Stijl'}
            value={style}
            onChange={setStyle}
            name={'style'}
            options={fontOptions}
            icon={'tags'}
          />
        </Grid>
        <Grid item>
          <HexColorPicker color={color} onChange={setColor} />
        </Grid>
        <Grid container item spacing={3} alignItems='center'>
          <Grid item>
            <FormatSize />
          </Grid>
          <Grid item xs>
            <Slider
              size='small'
              valueLabelDisplay='auto'
              step={0.1}
              min={0.1}
              max={2.0}
              value={size}
              onChange={(_, value) => setSize(typeof value === 'number' ? value : 0)}
            />
          </Grid>
        </Grid>

        <Grid container item spacing={3} alignItems='center'>
          <Grid item>
            <Straighten />
          </Grid>
          <Grid item xs>
            <Slider
              size='small'
              valueLabelDisplay='auto'
              step={1.0}
              min={1.0}
              max={25.0}
              value={distance}
              onChange={(_, value) => setDistance(typeof value === 'number' ? value : 0)}
            />
          </Grid>
        </Grid>
        <Grid container item justifyContent='space-between'>
          <Button.Primary onClick={handleCreate}>creeer</Button.Primary>
          <Button.Secondary onClick={handleDelete}>verwijder</Button.Secondary>
          <MUIButton size={'small'} color={'error'} variant={'contained'} onClick={handleReset}>
            reset
          </MUIButton>
        </Grid>
      </Grid>
    </Paper>
  );
};
