import React, { useState } from 'react';
import '../styles/style.css';
import { TextField, Paper, Button, Slider, Grid, MenuItem } from '@mui/material';
import { ShortText, FormatSize, Straighten, Style } from '@mui/icons-material';
import { nuiPost } from '../lib/nui';
import { ColorBox, createColor } from 'mui-color';

const fontStyles = [
    {
        value: 0,
        label: 'Normaal',
    },
    {
        value: 1,
        label: 'Cursief',
    },
    {
        value: 2,
        label: 'Normaal 2',
    },
    {
        value: 4,
        label: 'Normaal 3',
    },
    {
        value: 7,
        label: 'Vet',
    },
]

export const Menu = (props: IMenuProps) => {
    const [text, setText] = useState('');
    const [style, setStyle] = useState('');
    const [color, setColor] = useState(createColor('blue'));
    const [size, setSize] = useState(1.0);
    const [distance, setDistance] = useState(10);

    const handleCreate = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();

        nuiPost('Create', {
            text: text,
            color: color.hex,
            style: style,
            size: size,
            distance: distance
        })
        props.closeMenu()
    }

    const handleDelete = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();

        nuiPost('Delete')
        props.closeMenu()
    }

    const handleReset = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();

        setText('')
        setColor(createColor('blue'))
        setStyle('')
        setSize(1)
        setDistance(10)
    }

    return (
        <div style={props.style}>
            <Paper className="menu-box">
                <Grid container spacing={3}>
                    <Grid container item spacing={2} alignItems="center">
                        <Grid item>
                            <ShortText />
                        </Grid>
                        <Grid item xs>
                            <TextField
                                fullWidth
                                size='small'
                                label='Tekst'
                                variant='outlined'
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                        </Grid>
                    </Grid>

                    <Grid container item spacing={2} alignItems="center">
                        <Grid item>
                            <Style />
                        </Grid>
                        <Grid item xs>
                            <TextField
                                fullWidth
                                select
                                size='small'
                                label='Stijl'
                                variant='outlined'
                                value={style}
                                onChange={(e) => setStyle(e.target.value)}
                            >
                                {fontStyles.map((style) => (
                                    <MenuItem key={style.value} value={style.value}>
                                        {style.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>

                    <Grid item>
                        <ColorBox value={color} onChange={(color) => setColor(color)} disableAlpha />
                    </Grid>

                    <Grid container item spacing={3} alignItems="center">
                        <Grid item>
                            <FormatSize />
                        </Grid>
                        <Grid item xs>
                            <Slider
                                size="small"
                                valueLabelDisplay="auto"
                                step={0.1}
                                min={0.1}
                                max={2.0}
                                value={size}
                                onChange={(e, value) => setSize(typeof value === 'number' ? value : 0)}
                            />
                        </Grid>
                    </Grid>

                    <Grid container item spacing={3} alignItems="center">
                        <Grid item>
                            <Straighten />
                        </Grid>
                        <Grid item xs>
                            <Slider
                                size="small"
                                valueLabelDisplay="auto"
                                step={1.0}
                                min={1.0}
                                max={25.0}
                                value={distance}
                                onChange={(e, value) => setDistance(typeof value === 'number' ? value : 0)}
                            />
                        </Grid>
                    </Grid>

                    <Grid container item justifyContent='space-between'>
                        <Button color="primary" variant="contained" onClick={handleCreate}>creeer</Button>
                        <Button color="secondary" variant="contained" onClick={handleDelete}>verwijder</Button>
                        <Button color="info" variant="contained" onClick={handleReset}>reset</Button>
                    </Grid>
                </Grid>
            </Paper>
        </div>
    )
}