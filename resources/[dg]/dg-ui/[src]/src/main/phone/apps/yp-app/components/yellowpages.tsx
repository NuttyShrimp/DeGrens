import React, { FC, MouseEvent } from 'react';

import { Icon } from '../../../../../components/icon';
import { Textwrapper } from '../../../../../components/textwrapper';
import { openConversation } from '../../message-app/lib';
import { startPhoneCall } from '../../phone-app/lib';

import { styles } from './yellowpages.styles';

export const YPAd: FC<
  React.PropsWithChildren<{
    ad: Phone.YellowPages.Ad;
  }>
> = ({ ad }) => {
  const classes = styles();
  const replaceSpan = (e: MouseEvent, rplStr: String) => {
    const span = (e.target as any).querySelector('span.replaceSpan');
    if (span) {
      span.innerText = rplStr;
    }
  };
  return (
    <div className={classes.entry}>
      <div className={'title'}>{ad.name}</div>
      <div className={'description'}>
        <Textwrapper>{ad.text}</Textwrapper>
      </div>
      <div className={classes.btnWrapper}>
        <div
          className={classes.btn}
          onClick={() => startPhoneCall(ad.phone)}
          onMouseEnter={e => replaceSpan(e, ad.phone)}
          onMouseLeave={e => replaceSpan(e, 'Bel')}
        >
          <Icon name={'phone'} />
          <span className={'replaceSpan'}>Bel</span>
        </div>
        <div
          className={classes.btn}
          onClick={() => openConversation(ad.phone)}
          onMouseEnter={e => replaceSpan(e, ad.phone)}
          onMouseLeave={e => replaceSpan(e, 'Bericht')}
        >
          <Icon name={'comments-alt'} />
          <span className={'replaceSpan'}>Bericht</span>
        </div>
      </div>
    </div>
  );
};

export const YellowPages: AppFunction<Phone.YellowPages.State> = props => {
  const classes = styles();
  return (
    <div className={classes.list}>
      {props.list.map(ad => (
        <YPAd key={ad.id} ad={ad} />
      ))}
    </div>
  );
};
