import { useState } from 'react';
import { Box, Divider, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import { baseStyle } from '@src/base.styles';
import { Button, IconButton } from '@src/components/button';
import { Icon } from '@src/components/icon';
import { Input } from '@src/components/inputs';
import { Tooltip } from '@src/components/tooltip';
import { nuiAction } from '@src/lib/nui-comms';
import { hideFormModal, showCheckmarkModal, showFormModal, showLoadModal, showWarningModal } from '@src/main/phone/lib';

import { useRealEstateStore } from '../../stores/useRealEstateStore';

import { ConfirmTransferModal } from './ConfirmTransferModal';

export const AccessListModal = (props: { property: Phone.RealEstate.OwnedProperty }) => {
  const [removeCidAccess, fetchProperties] = useRealEstateStore(s => [s.removeCidAccess, s.fetchProperties]);
  const [newKeyCid, setNewKeyCid] = useState<number>(1000);

  return (
    <div>
      <Typography>
        Keys {props.property.accessList.length}/{props.property.metadata.maxKeys}
      </Typography>
      <Divider sx={{ marginY: '.5rem' }} />
      <List dense>
        {props.property.accessList.map(a => (
          <ListItem key={a.cid} disableGutters disablePadding>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }} width={'100%'}>
              <ListItemText primary={a.name} secondary={a.cid} />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title='Transfer ownership'>
                  <IconButton.Primary
                    onClick={() => {
                      showFormModal(<ConfirmTransferModal property={props.property} target={a} />);
                    }}
                  >
                    <Icon name='right-left' size={'1.2rem'} />
                  </IconButton.Primary>
                </Tooltip>
                <Tooltip title='Remove key'>
                  <IconButton.Secondary
                    onClick={async () => {
                      showLoadModal();
                      const success = await nuiAction(
                        'phone/realestate/removeKey',
                        { name: props.property.name, cid: a.cid },
                        true
                      );
                      success
                        ? showCheckmarkModal(() => {
                            removeCidAccess(props.property.name, a.cid);
                          })
                        : showWarningModal();
                    }}
                  >
                    <Icon name='trash-xmark' size={'1.2rem'} />
                  </IconButton.Secondary>
                </Tooltip>
              </Box>
            </Box>
          </ListItem>
        ))}
      </List>
      {props.property.accessList.length < props.property.metadata.maxKeys && (
        <>
          <Divider sx={{ marginY: '.5rem' }} />
          <Paper elevation={1} sx={{ background: baseStyle.primary.darker, padding: '.5rem' }}>
            <Input.Number
              label={'Give property key (CID)'}
              value={newKeyCid}
              min={1000}
              onChange={val => setNewKeyCid(Number(val))}
              size='small'
              margin='dense'
            />
            <div className='center'>
              <Button.Primary
                onClick={async () => {
                  if (newKeyCid < 1000) return;
                  showLoadModal();
                  const success = await nuiAction('phone/realestate/giveKey', {
                    name: props.property.name,
                    cid: newKeyCid,
                  });
                  typeof success !== 'string' && success
                    ? showCheckmarkModal(() => {
                        fetchProperties();
                      })
                    : showWarningModal(undefined, typeof success === 'string' ? success : undefined);
                }}
              >
                Give Key
              </Button.Primary>
            </div>
          </Paper>
        </>
      )}
      <Divider sx={{ marginY: '.5rem' }} />
      <div className='center'>
        <Button.Primary onClick={() => hideFormModal()}>Close</Button.Primary>
      </div>
    </div>
  );
};
