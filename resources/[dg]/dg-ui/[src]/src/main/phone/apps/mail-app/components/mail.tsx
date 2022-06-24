import React, { FC, useEffect, useState } from 'react';

import { formatRelativeTime, getFirstLine, sanitizeText } from '../../../../../lib/util';
import { AppContainer } from '../../../os/appcontainer/appcontainer';

import { styles } from './mail,styles';

export const MailEntry: FC<React.PropsWithChildren<{ mail: Phone.Mail.Mail }>> = ({ mail }) => {
  const [isExtended, setIsExtended] = useState(false);
  const classes = styles();

  return (
    <div className={classes.entry} onClick={() => setIsExtended(!isExtended)}>
      <div className={classes.textWrapper}>
        <div>Van: {mail.sender}</div>
        <div>Onderwerp: {mail.subject}</div>
        {isExtended ? (
          <div className={classes.body} dangerouslySetInnerHTML={{ __html: sanitizeText(mail.message) }} />
        ) : (
          <div className={[classes.body, 'small'].join(' ')}>{getFirstLine(mail.message)}</div>
        )}
      </div>
      <div className={classes.date}>{formatRelativeTime(mail.date)}</div>
    </div>
  );
};

export const Mail: AppFunction<Phone.Mail.State> = props => {
  const classes = styles();
  useEffect(() => {
    if (props.hasNotification) {
      props.updateState({
        hasNotification: false,
      });
    }
  }, []);
  return (
    <AppContainer emptyList={props.mails.length === 0}>
      <div className={classes.list}>
        {props.mails.map(mail => (
          <MailEntry key={mail.id} mail={mail} />
        ))}
      </div>
    </AppContainer>
  );
};
