import { ChannelZero } from './services/ChannelZero.ts';
import { Channel } from './Channel.ts';
import proto from 'https://esm.sh/@replit/protocol?target=deno';

export default class Client {
  public ws: WebSocket;
  public channel0: ChannelZero;
  public replToken: proto.api.ReplToken;
  public lastChannelId: number;
  public channels: Map<number, Channel>;
  public constructor(ws: WebSocket, token: proto.api.ReplToken) {
    this.ws = ws;
    this.channels = new Map<number, Channel>();
    this.channel0 = new ChannelZero(this);
    this.channels.set(0, this.channel0);
    this.replToken = token;
    this.lastChannelId = 0;
  }
}