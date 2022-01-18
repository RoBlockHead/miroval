import proto from 'https://esm.sh/@replit/protocol?target=deno';
import { Channel } from "./Channel.ts";
import { ChannelZero } from "./ChannelZero.ts";

export { ChannelZero } from './ChannelZero.ts';
export { Channel } from './Channel.ts';

export type Client = {
  ws: WebSocket,
  channels: Map<number, Channel>,
  channel0?: ChannelZero,
  id: number,
  token: proto.api.ReplToken,
  lastChannelId: number
}