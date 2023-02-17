import React, { useCallback } from 'react';
import AppWrapper from '@src/components/appwrapper';
import dayjs from 'dayjs';

import { ReportContainer } from './components/ReportContainer';
import { useReportStore } from './stores/reportStore';
import config from './_config';

import './style/index.scss';

const Container: AppFunction = props => {
  const [setReports, setReportMessages, setConnected, reportMessages] = useReportStore(s => [
    s.setReports,
    s.setReportMessages,
    s.setConnected,
    s.reportMessages,
  ]);

  const handleShow = useCallback(() => props.showApp(), [props.showApp]);
  const handleHide = useCallback(() => {
    props.hideApp();
    setReports([]);
    setReportMessages([]);
  }, [props.hideApp]);

  const eventHandler = (evt: any) => {
    switch (evt.action) {
      case 'setReports': {
        setReports(evt.data);
        break;
      }
      case 'setWSConnected': {
        setConnected(evt.connected);
        if (!evt.connected) {
          setReportMessages([]);
        }
        break;
      }
      case 'addMessages': {
        setReportMessages(
          [...evt.data, ...reportMessages].sort((m1, m2) => {
            return dayjs(m1.createdAt).isBefore(dayjs(m2.createdAt)) ? -1 : 1;
          })
        );
      }
    }
  };

  return (
    <AppWrapper appName={config.name} onShow={handleShow} onHide={handleHide} onEvent={eventHandler} hideOnEscape full>
      <ReportContainer />
    </AppWrapper>
  );
};

export default Container;
