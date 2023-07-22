import { FC, useCallback, useMemo } from 'react';
import { Divider } from '@mui/material';
import { baseStyle } from '@src/base.styles';
import { useMainStore } from '@src/lib/stores/useMainStore';

const capitalize = (text: string): string => {
  text = text.toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const ItemTooltip: FC<Inventory.Item> = ({
  id,
  label,
  description,
  metadata,
  markedForSeizure,
  quality,
  requirements,
  amount,
}) => {
  const isAdmin = useMainStore(s => s?.character?.isAdmin ?? false);

  const isMetadataEmpty = useMemo(() => {
    const hiddenKeys: string[] = metadata.hiddenKeys ?? [];
    return Object.keys(metadata).filter(key => key !== 'hiddenKeys' && !hiddenKeys.includes(key)).length === 0;
  }, [metadata]);

  const formatMetadata = useCallback(() => {
    const hiddenKeys: string[] = metadata.hiddenKeys ?? [];
    const formatted: JSX.Element[] = [];
    for (const [key, value] of Object.entries(metadata)) {
      if (hiddenKeys.some(hidden => key === hidden) || key === 'hiddenKeys') continue;
      let formattedValue = value.toString();
      if (typeof value === 'boolean') {
        formattedValue = value ? 'Ja' : 'Nee';
      }
      formatted.push(<span key={`${key}-span`}>{`${capitalize(key)}: ${formattedValue}`}</span>);
      formatted.push(<br key={`${key}-br`} />);
    }
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
          {description && (
            <>
              <Divider />
              <p className='description text'>{description}</p>
            </>
          )}
          {!isMetadataEmpty && (
            <>
              <Divider />
              <p className='data text'>{formatMetadata()}</p>
            </>
          )}
          {(quality || markedForSeizure) && (
            <>
              <Divider />
              {quality && <em className='data text'>Kwaliteit: {Math.round(quality)}%</em>}
              {markedForSeizure && (
                <em className='data text'>
                  {quality && <span> | </span>}
                  <span style={{ color: baseStyle.tertiary.light }}>Gemarkeerd voor inbeslagname</span>
                </em>
              )}
            </>
          )}
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
      {isAdmin && (
        <>
          <Divider />
          <p className='data text'>{`Item ID: ${id}`}</p>
        </>
      )}
    </>
  );
};
