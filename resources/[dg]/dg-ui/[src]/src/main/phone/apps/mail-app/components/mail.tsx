import { FC, useState } from 'react';
import * as React from 'react';
import { IconButton } from '@src/components/button';
import { Icon } from '@src/components/icon';
import { nuiAction } from '@src/lib/nui-comms';

import { formatRelativeTime, getFirstLine, sanitizeText } from '../../../../../lib/util';
import { AppContainer } from '../../../os/appcontainer/appcontainer';
import { useMailAppStore } from '../stores/useMailAppStore';

import { styles } from './mail.styles';

export const MailEntry: FC<React.PropsWithChildren<{ mail: Phone.Mail.Mail }>> = ({ mail }) => {
  const removeMail = useMailAppStore(s => s.removeMail);
  const [isExtended, setIsExtended] = useState(false);
  const classes = styles();

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    removeMail(mail.id);
    nuiAction('phone/mails/remove', { id: mail.id });
  };

  const handleSetLocation = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    if (!mail.coords) return;
    nuiAction('phone/mails/setLocation', { coords: mail.coords });
  };

  return (
    <div className={classes.entry} onClick={() => setIsExtended(!isExtended)}>
      <div className={classes.textWrapper}>
        <div className={classes.header}>
          <div>Van: {mail.sender}</div>
          <div>
            {mail.coords && (
              <IconButton.Primary onClick={handleSetLocation}>
                <Icon name='location-dot' size='0.8rem' />
              </IconButton.Primary>
            )}
            <IconButton.Primary onClick={handleRemove}>
              <Icon name='xmark' size='0.8rem' />
            </IconButton.Primary>
          </div>
        </div>
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
