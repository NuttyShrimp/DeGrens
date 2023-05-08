import { SQL, Util } from '@dgx/server';
import { queue_priority } from 'db';
import { getModule } from 'moduleController';
import { mainLogger } from 'sv_logger';
import { Logger } from 'winston';
import { Emojis, discordPower, queueGracePower } from '../constant.queue';
import dayjs from 'dayjs';
import { UserModule } from 'modules/users/module.users';

class QueueManager {
  private queue: string[] = [];
  private queueEntryInfo: Map<string, Core.Queue.EntryInfo> = new Map();
  private queueInterval: Map<string, NodeJS.Timer> = new Map();
  private power: Record<string, number> = {};
  private tempPower: Record<string, number> = {};
  private logger: Logger;
  private serverSize: number;
  private userModule: UserModule | null;

  constructor() {
    this.logger = mainLogger.child({
      module: 'QueueManager',
    });
    this.serverSize = GetConvarInt('sv_maxClients', 64);
    this.userModule = null;
    on('core:module:started', (name: string) => {
      if (name === 'users') {
        this.userModule = getModule('users');
      }
    });
  }

  private async getStartPosition(steamId: string) {
    const power = this.power[steamId];
    const plyInfo = this.queueEntryInfo.get(steamId);
    if (!plyInfo) return;
    const discordId = plyInfo.identifiers?.discord?.replace(/discord:/, '');
    if (!discordId) {
      DropPlayer(String(plyInfo.source), 'Failed to get discord Id while trying to assign queue position');
      return;
    }
    const discordRoles: string[] = await exports['dg-admin'].getPlyDiscordRoles(discordId);
    let position = this.queue.length;
    for (let ply of this.queue) {
      let plyPower = [
        this.power[ply] ?? 0,
        this.tempPower[ply] ?? 0,
        ...discordRoles.filter(id => discordPower?.[id]).map(id => discordPower[id]),
      ].reduce((prev, cur) => Math.max(prev, cur), 0);
      if (power < plyPower) {
        return position;
      }
      position--;
    }
  }

  private cleanupSteamId(steamId: string) {
    this.queue = this.queue.filter(s => s !== steamId);
    SetConvarServerInfo('queueSize', String(this.queue.length));
    const qInterval = this.queueInterval.get(steamId);
    if (qInterval) {
      clearInterval(qInterval);
    }
  }

  getQueuedPlayers() {
    return this.queue
      .map(id => this.queueEntryInfo.get(id))
      .filter(entry => entry !== undefined) as Core.Queue.EntryInfo[];
  }

  isInQueue(steamId: string) {
    return this.queue.find(s => s === steamId);
  }

  setPosition(steamId: string, pos: number) {
    const newQ = this.queue.filter(s => s !== steamId);
    this.queue = [...newQ.slice(0, pos), steamId, ...newQ.slice(pos, this.queue.length)];
    SetConvarServerInfo('queueSize', String(this.queue.length));
    if (this.tempPower[steamId]) {
      delete this.tempPower[steamId];
    }
  }

  async loadDBPower() {
    const power = await SQL.query<queue_priority[]>('SELECT * FROM queue_priority');
    power.forEach(p => {
      this.power[p.steamid] = p.priority;
    });
  }

  async joinQueue(src: number, name: string, steamId: string, deferrals: Record<string, any>) {
    if (this.serverSize - GetNumPlayerIndices() != 0) {
      deferrals.done();
      return;
    }

    if (this.queue.includes(steamId)) {
      this.logger.warn(`${name}(${src}) tried to join the queue but is already in it`);
      deferrals.done('A client with the same steamId is already in the queue');
      return;
    }
    this.queueEntryInfo.set(steamId, {
      identifiers: this.userModule!.getPlyIdentifiers(src),
      source: src,
      name,
    });
    this.cleanupSteamId(steamId);
    const startPos = await this.getStartPosition(steamId);
    this.setPosition(steamId, startPos ?? this.queue.length);
    let timeInQ = dayjs(0).set('h', 0);
    const qInterval = setInterval(() => {
      const pos = this.queue.findIndex(s => s === steamId);
      if (pos === -1) {
        clearInterval(qInterval);
      }
      const endpoint = GetPlayerEndpoint(String(src));
      if (!endpoint) {
        this.quitQueue(steamId);
      }
      deferrals.update(
        `Your position: ${pos + 1}/${this.queue.length} | ${Emojis[Util.getRndInteger(0, Emojis.length)]}${
          Emojis[Util.getRndInteger(0, Emojis.length)]
        }${Emojis[Util.getRndInteger(0, Emojis.length)]} | 🕒 ${timeInQ.format('HH:mm:ss')}`
      );
      timeInQ = timeInQ.add(1, 's');
    }, 1000);
    this.queueInterval.set(steamId, qInterval);
  }

  finishQueue(source: number, oldSource: number) {
    const userMod = getModule('users');
    const steamId = userMod.getPlyIdentifiers(oldSource)?.steam || userMod.getPlyIdentifiers(source)?.steam;
    if (!steamId) {
      this.logger.warn(`Failed to remove player from queue: ${oldSource} -> ${source}`);
      return;
    }
    this.cleanupSteamId(steamId);
  }

  quitQueue(steamId: string) {
    this.cleanupSteamId(steamId);
    this.giveTempBoost(steamId);
    setTimeout(() => {
      if (this.getCurrentBoost(steamId) === queueGracePower) {
        this.giveTempBoost(steamId, 0);
      }
    }, 5 * 60000);
  }

  async giveTempBoost(steamId: string, power = queueGracePower) {
    this.tempPower[steamId] = power;
    const newPos = await this.getStartPosition(steamId);
    const curPos = this.queue.findIndex(s => s === steamId);
    if (curPos === -1 || !newPos) return;
    if (newPos > curPos) {
      this.setPosition(steamId, newPos);
    }
  }

  getCurrentBoost(steamId: string) {
    let boost = this.tempPower[steamId];
    if (!boost) {
      boost = this.power[steamId];
    }
    return boost ?? 0;
  }
}

export const queueManager = new QueueManager();
