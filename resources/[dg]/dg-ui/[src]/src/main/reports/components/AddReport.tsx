import { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';
import { Button } from '@src/components/button';
import { Input } from '@src/components/inputs';
import { useEditor } from '@src/lib/hooks/useEditor';
import { nuiAction } from '@src/lib/nui-comms';
import { EditorContent } from '@tiptap/react';

import { useReportStore } from '../stores/reportStore';

export const AddReport = () => {
  const [setTitleInfo, selectReport] = useReportStore(s => [s.setTitleInfo, s.selectReport]);
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const messageEditor = useEditor({
    placeholder: 'Leg hier het uitgebreide probleem uit',
  });

  useEffect(() => {
    setTitleInfo({
      title: 'Nieuw Report',
      add: false,
      back: true,
      close: false,
    });
  }, []);

  const createReport = async () => {
    if (title === '' || messageEditor?.isEmpty) return;
    setCreating(true);
    const { reportId } = await nuiAction('reports/createReport', {
      info: {
        title,
        message: messageEditor?.getJSON() ?? {},
      },
    });
    messageEditor?.commands.clearContent();
    setTitle('');
    setCreating(false);
    selectReport(reportId);
  };

  return (
    <Container className='reports-add-container'>
      <div className='center'>
        <Input.TextField
          label={'Titel'}
          placeholder='Korte omschrijving over het reportje'
          value={title}
          onChange={setTitle}
        />
        <Typography variant='body2' marginTop={'.5vh'}>
          Plaats hieronder jouw bericht
        </Typography>
        <EditorContent editor={messageEditor} className='reports-add-editor' />
        <Button.Primary disabled={creating} style={{ marginTop: '2vh' }} onClick={createReport}>
          Create
        </Button.Primary>
      </div>
    </Container>
  );
};
