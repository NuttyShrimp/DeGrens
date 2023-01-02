import React, { FC, useCallback, useMemo } from 'react';
import { Divider } from '@mui/material';

const capitalize = (text: string): string => {
  text = text.toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const ItemTooltip: FC<Inventory.Item> = ({
  label,
  description,
  metadata,
  markedForSeizure,
  quality,
  requirements,
  amount,
}) => {
  const isMetadataEmpty = useMemo(() => {
    const hiddenKeys: string[] | undefined = metadata.hiddenKeys;
    if (!hiddenKeys) return Object.keys(metadata).length === 0;
    return Object.keys(metadata).filter(key => !hiddenKeys.some(hidden => key === hidden)).length === 0;
  }, [metadata]);

  const formatMetadata = useCallback(() => {
    const hiddenKeys: string[] = metadata.hiddenKeys ?? [];
    const formatted: JSX.Element[] = [];
    Object.entries(metadata)
      .filter(([key]) => !hiddenKeys.some(hidden => key === hidden) || key !== 'hiddenKeys')
      .forEach(([key, value]) => {
        formatted.push(<span key={`${key}-span`}>{`${capitalize(key)}: ${value.toString()}`}</span>);
        formatted.push(<br key={`${key}-br`} />);
      });
    return formatted;
  }, [metadata]);

  const formatRequiredItems = useCallback(() => {
    const items = requirements?.items ?? [];
    const formatted = new Map<string, string>(); // name - label
    items.forEach(item => {
      if (formatted.has(item.name)) return;
      formatted.set(item.name, `${item.amount}x ${item.label}`);
    });

    return [...formatted.values()].reduce<JSX.Element[]>((acc, text, key) => {
      acc.push(<span key={`${key}-span`}>{text}</span>);
      acc.push(<br key={`${key}-br`} />);
      return acc;
    }, []);
  }, [requirements]);

  return (
    <>
      <p className='label text'>{label}</p>
      {amount !== undefined && (
        <>
          <Divider />
          <p className='description text' style={{ fontSize: '1.6vh' }}>
            Aantal beschikbaar: {amount}
          </p>
        </>
      )}
      {requirements === undefined ? (
        <>
          {(description || !isMetadataEmpty) && (
            <>
              <Divider />
              {description && <p className='description text'>{description}</p>}
              {!isMetadataEmpty && (
                <>
                  <Divider />
                  <p className='data text'>{formatMetadata()}</p>
                </>
              )}
            </>
          )}
          <Divider />
          <em className='data text'>Kwaliteit: {Math.round(quality)}%</em>
          {markedForSeizure && <em className='data text'> | Gemarkeerd voor inbeslagname </em>}
        </>
      ) : (
        <>
          {requirements.cash && (
            <>
              <Divider />
              <p className='description text'>{`Prijs: €${requirements.cash}`}</p>
            </>
          )}
          {requirements.items && (
            <>
              <Divider />
              <p className='description text'>
                {`Benodigdheden:`}
                <br />
                {formatRequiredItems()}
              </p>
            </>
          )}
        </>
      )}
    </>
  );
};
