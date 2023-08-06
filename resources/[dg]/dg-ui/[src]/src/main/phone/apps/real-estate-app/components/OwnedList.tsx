import { useEffect, useMemo } from 'react';
import { Typography } from '@mui/material';
import { Paper } from '@src/components/paper';
import { nuiAction } from '@src/lib/nui-comms';
import { showCheckmarkModal, showFormModal, showWarningModal } from '@src/main/phone/lib';

import { useRealEstateStore } from '../stores/useRealEstateStore';

import { AccessListModal } from './modals/KeyListModal';
import { SetLocationModal } from './modals/SetLocationsModal';

export const OwnedPropertiesList = () => {
  const [properties, toggleLock, fetchProperties] = useRealEstateStore(s => [
    s.properties,
    s.toggleLock,
    s.fetchProperties,
  ]);

  const ownedProperties = useMemo(() => properties.filter(p => p.owned), [properties]);
  const accessibleProperties = useMemo(() => properties.filter(p => !p.owned), [properties]);

  const generateBaseActions = (property: Phone.RealEstate.Property) => [
    {
      title: property.locked ? 'Unlock' : 'Lock',
      icon: property.locked ? 'lock' : 'lock-open',
      onClick: async () => {
        const newState: boolean = await nuiAction(
          'phone/realestate/toggleLock',
          { name: property.name },
          !property.locked
        );
        toggleLock(property.name, newState);
      },
    },
  ];

  const generateOwnedActions = (property: Phone.RealEstate.Property): Action[] => {
    const actions: Action[] = generateBaseActions(property);
    if (!property.owned) return actions;

    actions.push({
      title: 'Change access',
      icon: 'key',
      onClick: () => {
        showFormModal(<AccessListModal property={property} />);
      },
    });

    if (property.flags.garage) {
      actions.push({
        title: 'Set garage',
        icon: 'garage',
        onClick: async () => {
          const success = await nuiAction('phone/realestate/setGarageLocation', { name: property.name }, true);
          success && typeof success !== 'string'
            ? showCheckmarkModal()
            : showWarningModal(undefined, typeof success === 'string' ? success : undefined);
        },
      });
    }

    if (property.flags.locations) {
      actions.push({
        title: 'Change locations',
        icon: 'location-pen',
        onClick: () => {
          showFormModal(<SetLocationModal property={property} />);
        },
      });
    }

    return actions;
  };

  const generateAccessActions = (property: Phone.RealEstate.Property) => {
    const actions: Action[] = generateBaseActions(property);

    actions.push({
      title: 'Remove keys from house',
      icon: 'right-from-bracket',
      onClick: async () => {
        const success = await nuiAction('phone/realestate/selfRemoveKey', { name: property.name }, true);
        success
          ? showCheckmarkModal(() => {
              fetchProperties();
            })
          : showWarningModal();
      },
    });

    return actions;
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <div>
      {properties.length !== 0 && (
        <>
          <Typography variant='body1' fontWeight='semibold'>
            Owned properties
          </Typography>
          {ownedProperties.map(p => (
            <Paper key={p.name} title={p.name} actions={generateOwnedActions(p)} />
          ))}
        </>
      )}
      {properties.length !== 0 && (
        <>
          <Typography variant='body1' fontWeight='semibold'>
            Accessible properties
          </Typography>
          {accessibleProperties.map(p => (
            <Paper key={p.name} title={p.name} actions={generateAccessActions(p)} />
          ))}
        </>
      )}
      {properties.length === 0 && (
        <div className={'emptylist'}>
          <i className='fas fa-frown' />
          <Typography variant='body1' fontWeight='semibold' textAlign='center'>
            You don&apos;t own any properties
          </Typography>
        </div>
      )}
    </div>
  );
};
