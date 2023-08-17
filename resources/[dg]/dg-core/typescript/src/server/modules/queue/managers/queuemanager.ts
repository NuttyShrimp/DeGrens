import { Admin, SQL, Util } from '@dgx/server';
import { queue_priority } from 'db';
import { getModule } from 'moduleController';
import { mainLogger } from 'sv_logger';
import { Logger } from 'winston';
import { Emojis, discordPower, queueGracePower } from '../constant.queue';
import dayjs from 'dayjs';
import { UserModule } from 'modules/users/module.users';
import { generateQueueCard } from '../util.queue';

class QueueManager {
  // Sorted array of steamIds
  private queue: string[] = ['steam:11000010b3c8b9e', 'steam:110001'];
  private queueEntryInfo: Map<string, Core.Queue.EntryInfo> = new Map();
  private queueInterval: Map<string, NodeJS.Timer> = new Map();
  private power: Record<string, number> = {};
  private tempPower: Record<string, number> = {};
  private queueGrace: Record<string, number> = {};
  private graceThreads: Record<string, NodeJS.Timeout> = {};
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
    let power = Number(this.queueEntryInfo.get(steamId)?.power ?? 0);
    let position = 0;
    for (let ply of this.queue) {
      let plyInfo = this.queueEntryInfo.get(ply);
      let plyPower = Number(plyInfo?.power ?? 0);
      if (power > plyPower) {
        return position;
      }
      position++;
    }
  }

  private cleanupSteamId(steamId: string) {
    this.queue = this.queue.filter(s => s !== steamId);
    const qInfo = this.queueEntryInfo.get(steamId);
    this.queueEntryInfo.delete(steamId);
    SetConvarServerInfo('queueSize', String(this.queue.length));
    const qInterval = this.queueInterval.get(steamId);
    if (qInterval) {
      clearInterval(qInterval);
    }
    if (qInfo) {
      this.userModule?.onPlayerDropped(qInfo?.source);
    }
    if (this.graceThreads[steamId]) {
      clearTimeout(this.graceThreads[steamId]);
    }
    let graceRemover = setTimeout(
      () => {
        if (this.queueGrace[steamId]) {
          delete this.queueGrace[steamId];
        }
      },
      3 * 60 * 1000
    );
    this.graceThreads[steamId] = graceRemover;
  }

  private slotsAvailable() {
    return this.serverSize - GetNumPlayerIndices();
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
    // NOTE: This is disabled because if 2 players join at the same time with 1 slot open, our server will go over the limit
    // if (this.isSlotAvailable() && this.queue.length === 0) {
    //   deferrals.done();
    //   return;
    // }
    if (Admin.hasSteamIdPermission(steamId, 'developer')) {
      deferrals.done();
      return;
    }

    if (this.queue.includes(steamId)) {
      this.logger.warn(`${name}(${src}) tried to join the queue but is already in it`);
      deferrals.done('A client with the same steamId is already in the queue');
      return;
    }
    let queueInfo = this.queueEntryInfo
      .set(steamId, {
        identifiers: this.userModule!.getPlyIdentifiers(src),
        source: src,
        name,
        power: 0,
      })
      .get(steamId);
    if (!queueInfo) {
      DropPlayer(String(src), 'Failed to join the queue, try again');
      return;
    }
    queueInfo.power = (await this.getCurrentBoost(steamId)) ?? 0;

    if (this.graceThreads[steamId]) {
      clearTimeout(this.graceThreads[steamId]);
    }

    const startPos = await this.getStartPosition(steamId);
    this.setPosition(steamId, startPos ?? this.queue.length);

    let timeInQ = dayjs(0).set('h', 0);

    const showCard = generateQueueCard(deferrals);
    const qInterval = setInterval(() => {
      const pos = this.queue.findIndex(s => s === steamId);
      if (pos === -1) {
        clearInterval(qInterval);
        this.cleanupSteamId(steamId);
        return;
      }
      this.queueGrace[steamId] = pos;
      const endpoint = GetPlayerEndpoint(String(src));
      if (!endpoint) {
        this.cleanupSteamId(steamId);
      }
      showCard(
        `Your position: ${pos + 1}/${this.queue.length} | ${Emojis[Util.getRndInteger(0, Emojis.length)]}${
          Emojis[Util.getRndInteger(0, Emojis.length)]
        }${Emojis[Util.getRndInteger(0, Emojis.length)]} | 🕒 ${timeInQ.format('HH:mm:ss')}`
      );
      if (pos < this.slotsAvailable()) {
        deferrals.done();
      }
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
    if (this.graceThreads[steamId]) {
      clearTimeout(this.graceThreads[steamId]);
    }
    if (this.queueGrace[steamId]) {
      delete this.queueGrace[steamId];
    }
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

  async getCurrentBoost(steamId: string) {
    const plyInfo = this.queueEntryInfo.get(steamId);
    if (!plyInfo) return;
    const discordId = plyInfo.identifiers?.discord?.replace(/discord:/, '');
    const discordRoles: string[] = await exports['dg-admin'].getPlyDiscordRoles(discordId);
    return [
      this.power[steamId] ?? 0,
      this.tempPower[steamId] ?? 0,
      ...discordRoles.filter(id => discordPower?.[String(id)]).map(id => discordPower[String(id)]),
    ].reduce((prev, cur) => Math.max(prev, cur), 0);
  }
}

export const queueManager = new QueueManager();
