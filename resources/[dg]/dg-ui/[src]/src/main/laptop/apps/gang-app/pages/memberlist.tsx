import React, { FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HandshakeIcon from '@mui/icons-material/Handshake';
import { Button, IconButton, TextField, Tooltip } from '@mui/material';
import { Stack } from '@mui/system';
import { nuiAction } from '@src/lib/nui-comms';
import { useActions } from '@src/main/laptop/hooks/useActions';

export const MemberCard: FC<
  Laptop.Gang.Member & { fetchGangData: () => Promise<void>; showTransferOwnership: boolean; gangName: string }
> = props => {
  const { openConfirm } = useActions();

  const handleKick = () => {
    openConfirm({
      label: `Ben je zeker dat je ${props.name} wil kicken?`,
      onAccept: async () => {
        await nuiAction('laptop/gang/kick', { cid: props.cid, gang: props.gangName });
        props.fetchGangData();
      },
    });
  };

  const handlePromote = () => {
    openConfirm({
      label: `Ben je zeker dat je ${props.name} wil promoveren?`,
      onAccept: async () => {
        await nuiAction('laptop/gang/promote', { cid: props.cid, gang: props.gangName });
        props.fetchGangData();
      },
    });
  };

  const handleDegrade = () => {
    openConfirm({
      label: `Ben je zeker dat je ${props.name} wil degraderen?`,
      onAccept: async () => {
        await nuiAction('laptop/gang/degrade', { cid: props.cid, gang: props.gangName });
        props.fetchGangData();
      },
    });
  };

  const handleTransfer = () => {
    openConfirm({
      label: `Ben je zeker dat je het leiderschap wil overzetten naar ${props.name}?`,
      onAccept: async () => {
        await nuiAction('laptop/gang/transfer', { cid: props.cid, gang: props.gangName });
        props.fetchGangData();
      },
    });
  };

  return (
    <div className='card'>
      <p style={{ fontWeight: props.isOwner ? 'bold' : 'normal' }}>{props.name}</p>
      <div>
        {!props.isOwner && (
          <>
            {props.showTransferOwnership && (
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
  members: Laptop.Gang.Member[];
  fetchGangData: () => Promise<void>;
}> = ({ members, fetchGangData }) => {
  const { openConfirm } = useActions();
  const [inputCid, setInputCid] = useState<number>(0);
  const cid = useSelector<RootState, number>(state => state.character.cid);
  const gangName = useSelector<RootState, string>(state => state['laptop.gang'].name);
  const showTransferOwnership = useMemo(() => cid === members.find(m => m.isOwner)?.cid, [cid, members]);

  const handleCidChange = (input?: string) => {
    const cid = Number(input);
    if (input === undefined || input === '' || isNaN(cid)) {
      setInputCid(0);
      return;
    }
    setInputCid(cid);
  };

  const handleAddMember = async () => {
    if (!inputCid) return;
    openConfirm({
      label: `Ben je zeker dat de persoon (CID ${inputCid}) een verzoek wil sturen?`,
      onAccept: async () => {
        await nuiAction('laptop/gang/add', { cid: inputCid, gang: gangName });
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
              showTransferOwnership={showTransferOwnership}
              gangName={gangName}
            />
          ))}
        </Stack>
      </div>
    </div>
  );
};
