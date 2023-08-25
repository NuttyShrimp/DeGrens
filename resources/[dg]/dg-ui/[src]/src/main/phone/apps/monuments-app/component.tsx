import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import { baseStyle } from '@src/base.styles';
import { copyToClipboard } from '@src/lib/util';

import { setBigPhoto } from '../../lib';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { MONUMENTS } from './data';

const Component: AppFunction = () => {
  return (
    <AppContainer>
      <div>
        <Typography variant='subtitle2'>
          Hieronder vind je enkele van de mooiste plaatsen op het eiland.
          <br />
          Voor de link naar de foto moet je erop klikken
        </Typography>
      </div>
      {MONUMENTS.map(monument => (
        <Card
          key={monument.name}
          sx={{
            backgroundColor: baseStyle.primaryDarker.dark,
            marginTop: '1vh',
          }}
          onMouseEnter={() => setBigPhoto(monument.url)}
          onMouseLeave={() => setBigPhoto(null)}
          onClick={() => copyToClipboard(monument.url)}
        >
          <CardMedia sx={{ height: 140 }} image={monument.url} title='A monument' />
          <CardContent sx={{ padding: '1vh!important' }}>
            <Typography variant='body2'>{monument.description}</Typography>
          </CardContent>
        </Card>
      ))}
    </AppContainer>
  );
};

export default Component;
