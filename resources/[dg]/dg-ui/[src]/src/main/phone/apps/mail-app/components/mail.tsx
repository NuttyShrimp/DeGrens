import React, { FC, useState } from 'react';

import { formatRelativeTime, getFirstLine, sanitizeText } from '../../../../../lib/util';
import { AppContainer } from '../../../os/appcontainer/appcontainer';
import { useMailAppStore } from '../stores/useMailAppStore';

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

export const Mail = () => {
  const mails = useMailAppStore(s => s.mails);
  const classes = styles();
  return (
    <AppContainer emptyList={mails.length === 0}>
      <div className={classes.list}>
        {mails.map(mail => (
          <MailEntry key={mail.id} mail={mail} />
        ))}
      </div>
    </AppContainer>
  );
};
