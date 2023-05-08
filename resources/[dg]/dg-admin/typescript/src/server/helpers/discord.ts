import { Config } from '@dgx/server';
import axios from 'axios';

import { mainLogger } from '../sv_logger';

import { getIdentifierForPlayer } from './identifiers';

// region Config
let config: DiscordConfig;

setImmediate(async () => {
  await Config.awaitConfigLoad();
  config = Config.getConfigValue('admin.discord');
  testSettings();
});

on('dg-config:moduleLoaded', (module: string, data: DiscordConfig) => {
  if (module !== 'admin.discord') return;
  config = data;
  testSettings();
});
// endregion

const discordRequest = async (method: string, endpoint: string, data?: any) => {
  try {
    const result = await axios.request({
      method,
      url: `https://discord.com/api/v10/${endpoint}`,
      data,
      headers: {
        Authorization: `Bot ${config.token}`,
        ['Content-Type']: 'application/json',
      },
    });
    return {
      data: result.data,
      status: result.status,
      statusText: result.statusText,
    };
  } catch (e: any) {
    if (e.response && e.response.status === 404) {
      return;
    }
    console.error(e);
    mainLogger.error('Failed to make request to discord API');
  }
};

const testSettings = async () => {
  const guild = await discordRequest('GET', `guilds/${config.guildId}`);
  if (!guild) return;
  if (guild.status !== 200) {
    mainLogger.error(`Failed to get Guild from discord API. Validate config: ${guild.status} ${guild.statusText}`);
    return;
  }
  mainLogger.debug(`Made successful connection to discord API for role checking. Active on ${guild.data?.name} `);
};

export const getPlayerDiscordRoles = async (discordId: string): Promise<string[]> => {
  const endpoint = `guilds/${config.guildId}/members/${discordId}`;
  const member = await discordRequest('GET', endpoint);
  if (!member) return [];
  return member.status !== 200 ? [] : member.data.roles;
};

export const GetPlyDiscordRolesByServerId = async (src: number) => {
  const identifier = getIdentifierForPlayer(src, 'discord');
  if (!identifier) return [];
  const discordId = identifier.replace('discord:', '');
  if (!discordId) return [];
  return getPlayerDiscordRoles(discordId);
};

export const doesPlayerHaveWhitelistedRole = async (src: number): Promise<boolean> => {
  if (!config.whitelist.enabled) return false;
  const roles = await GetPlyDiscordRolesByServerId(src);
  return Object.values(config.whitelist.roles).some(role => roles.includes(String(role)));
};