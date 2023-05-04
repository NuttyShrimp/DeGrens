import { onPlayerDropped, onPlayerJoined, onPlayerJoining } from 'moduleController';

on('playerConnecting', onPlayerJoining);
on('playerJoining', onPlayerJoined);
on('playerDropped', onPlayerDropped);
