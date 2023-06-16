import { FC, useMemo, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HandshakeIcon from '@mui/icons-material/Handshake';
import { Button, IconButton, TextField, Tooltip } from '@mui/material';
import { Stack } from '@mui/system';
import { nuiAction } from '@src/lib/nui-comms';
import { useActions } from '@src/main/laptop/hooks/useActions';

export const MemberCard: FC<
  Laptop.Gang.Member & {
    fetchGangData: () => Promise<void>;
    gangName: string;
    showTransfer: boolean;
  }
> = props => {
  const { openConfirm, addNotification } = useActions();

  const handleKick = () => {
    openConfirm({
      label: `Ben je zeker dat je ${props.name} wil kicken?`,
      onAccept: async () => {
        const result = await nuiAction<{ success: boolean }>(
          'laptop/gang/kick',
          {
            cid: props.cid,
            gang: props.gangName,
          },
          true
        );
        if (!result.success) {
          addNotification('gang', 'Er is iets misgelopen met deze actie');
        }
        props.fetchGangData();
      },
    });
  };

  const handlePromote = () => {
    openConfirm({
      label: `Ben je zeker dat je ${props.name} wil promoveren?`,
      onAccept: async () => {
        const result = await nuiAction<{ success: boolean }>(
          'laptop/gang/promote',
          {
            cid: props.cid,
            gang: props.gangName,
          },
          true
        );
        if (!result.success) {
          addNotification('gang', 'Er is iets misgelopen met deze actie');
        }
        props.fetchGangData();
      },
    });
  };

  const handleDegrade = () => {
    openConfirm({
      label: `Ben je zeker dat je ${props.name} wil degraderen?`,
      onAccept: async () => {
        const result = await nuiAction<{ success: boolean }>(
          'laptop/gang/degrade',
          {
            cid: props.cid,
            gang: props.gangName,
          },
          true
        );
        if (!result.success) {
          addNotification('gang', 'Er is iets misgelopen met deze actie');
        }
        props.fetchGangData();
      },
    });
  };

  const handleTransfer = () => {
    openConfirm({
      label: `Ben je zeker dat je het leiderschap wil overzetten naar ${props.name}?`,
      onAccept: async () => {
        const result = await nuiAction<{ success: boolean }>(
          'laptop/gang/transfer',
          {
            cid: props.cid,
            gang: props.gangName,
          },
          true
        );
        if (!result.success) {
          addNotification('gang', 'Er is iets misgelopen met deze actie');
        }
        props.fetchGangData();
      },
    });
  };

  return (
    <div className='card'>
      <p style={{ fontWeight: props.isOwner ? 'bold' : 'initial' }}>{props.name}</p>
      <div>
        {!props.isOwner && !props.isPlayer && (
          <>
            {props.showTransfer && (
              <Tooltip title='Transfer Ownership'>
                <IconButton onClick={handleTransfer}>
                  <HandshakeIcon />
                </IconButton>
              </Tooltip>
            )}
            {props.hasPerms ? (
              <Tooltip title='Degrade'>
                <IconButton onClick={handleDegrade}>
                  <ExpandMoreIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title='Promote'>
                <IconButton onClick={handlePromote}>
                  <ExpandLessIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title='Kick'>
              <IconButton onClick={handleKick}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </div>
    </div>
  );
};

export const MemberList: FC<{
  gangName: string;
  members: Laptop.Gang.Member[];
  fetchGangData: () => Promise<void>;
}> = ({ gangName, members, fetchGangData }) => {
  const { openConfirm, addNotification } = useActions();
  const [inputCid, setInputCid] = useState<number>(0);
  // If player is also owner then show transfer
  const showTransfer = useMemo(() => members.find(m => m.isPlayer)?.isOwner ?? false, [members]);

  const handleCidChange = (input?: string) => {
    const numberInput = Number(input);
    if (input === undefined || input === '' || isNaN(numberInput)) {
      setInputCid(0);
      return;
    }
    setInputCid(numberInput);
  };

  const handleAddMember = async () => {
    if (!inputCid) return;
    openConfirm({
      label: `Ben je zeker dat de persoon (CID ${inputCid}) een verzoek wil sturen?`,
      onAccept: async () => {
        const result = await nuiAction<{ success: boolean }>(
          'laptop/gang/add',
          { cid: inputCid, gang: gangName },
          true
        );
        if (!result.success) {
          addNotification('gang', 'Er is iets misgelopen met deze actie');
        }
        fetchGangData();
      },
    });
  };

  return (
    <div className='laptop-gang-members'>
      <div className='cidinput'>
        <TextField
          label='CID Uitnodigen'
          fullWidth
          variant='outlined'
          size='small'
          color='secondary'
          value={inputCid}
          onChange={e => handleCidChange(e.target.value)}
        />
        <Button variant='outlined' onClick={handleAddMember} color={'secondary'} size='small'>
          add
        </Button>
      </div>
      <div className='list'>
        <Stack spacing={1}>
          {members.map(m => (
            <MemberCard
              key={`gang-member-${m.cid}`}
              {...m}
              fetchGangData={fetchGangData}
              gangName={gangName}
              showTransfer={showTransfer}
            />
          ))}
        </Stack>
      </div>
    </div>
  );
};
