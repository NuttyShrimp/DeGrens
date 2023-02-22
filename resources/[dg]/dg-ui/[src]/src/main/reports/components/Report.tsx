import React, { useEffect, useMemo, useRef } from 'react';
import { Divider } from '@mui/material';
import { IconButton } from '@src/components/button';
import { Icon } from '@src/components/icon';
import { useEditor } from '@src/lib/hooks/useEditor';
import { nuiAction } from '@src/lib/nui-comms';
import { EditorContent } from '@tiptap/react';

import { useReportStore } from '../stores/reportStore';

import { ReportMessage } from './ReportMessage';

export const Report = () => {
  const [connected, messages, reportInfo, reportId, setTitleInfo, setMessages] = useReportStore(s => [
    s.connected,
    s.reportMessages,
    s.reports.find(r => r.id === s.selectedReport),
    s.selectedReport,
    s.setTitleInfo,
    s.setReportMessages,
  ]);
  const messageListRef = useRef<HTMLDivElement | null>(null);

  const editor = useEditor({
    placeholder: 'Uw report...',
  });

  useEffect(() => {
    setTitleInfo({
      title: reportInfo?.title ?? 'Unknown report',
      back: true,
      add: false,
      close: true,
    });
    return () => {
      nuiAction('reports/closeSocket', { id: reportId });
      setMessages([]);
    };
  }, []);

  const sendMessage = async () => {
    if (editor?.isEmpty) return;
    const msgContent = editor?.getJSON();
    await nuiAction('reports/sendMessage', {
      id: reportId,
      msg: msgContent,
    });
    editor?.commands.clearContent();
  };

  const revMsgs = useMemo(() => messages.reverse(), [messages]);

  if (!reportInfo) {
    return (
      <div>
        <p>Onbekend report</p>
        <p>Geen info gevonden omtrent dit report. Gelieve terug te keren naar het hoofdmenu</p>
      </div>
    );
  }

  if (!connected) {
    return (
      <div>
        <p>Connecting to report...</p>
        <p>Dit kan even duren. Als het report na een minuut nog niet geladen is probeer het menu opnieuw te openen</p>
      </div>
    );
  }

  return (
    <div className='reports-message-container'>
      <div className='reports-message-list' ref={messageListRef}>
        {revMsgs.map(m => (
          <ReportMessage key={m.id} message={m} />
        ))}
      </div>
      <Divider />
      <div className='reports-message-editor'>
        <EditorContent editor={editor} width='100%' />
        <IconButton.Primary onClick={sendMessage}>
          <Icon name='paper-plane-top' size={'1.1rem'} />
        </IconButton.Primary>
      </div>
    </div>
  );
};