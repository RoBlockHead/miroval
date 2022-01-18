import { ShellChannel } from './ShellChannel.ts';
import { OTChannel } from './OTChannel.ts';
import { ChatChannel } from './ChatChannel.ts';
import { FilesChannel } from './FilesChannel.ts';
import DotReplitChannel from './DotReplitChannel.ts';
import Client from '../Client.ts';
import { Channel } from '../Channel.ts';
import proto from "https://esm.sh/@replit/protocol?target=deno";

export class ChannelZero extends Channel {
  public openChannels: Map<number, Channel>;

  public constructor(client: Client) {
    super(client, 0, "Hypervisor", "hypervisor");
    this.openChannels = new Map<number, Channel>();
    this.openChannels.set(0, this);
  }

  public openChannel(request: proto.api.OpenChannel, ref: string) {
    if (request.action === proto.api.OpenChannel.Action.ATTACH) {
      let matchedChannel: Channel | undefined;
      this.openChannels.forEach((channel) => {
        if (channel.name === request.name) {
          matchedChannel = channel;
        }
      });
      if (matchedChannel) {
        this.send(<proto.api.Command>{
          openChanRes: <proto.api.OpenChannelRes>{
            id: matchedChannel.id,
            state: proto.api.OpenChannelRes.State.ATTACHED,
          },
          ref: ref
        })
      } else {
        this.send(<proto.api.Command>{
          error: "Channel not found.",
        });
      }
    } else if(request.action === proto.api.OpenChannel.Action.ATTACH_OR_CREATE) {
      let matchedChannel: Channel | undefined;
      this.openChannels.forEach((channel) => {
        if (channel.name === request.name) {
          matchedChannel = channel;
        }
      });
      if (matchedChannel) {
        this.send(<proto.api.Command>{
          openChanRes: <proto.api.OpenChannelRes>{
            id: matchedChannel.id,
            state: proto.api.OpenChannelRes.State.ATTACHED,
          },
          ref: ref
        })
      } else {
        this.createChannel(request, ref);
      } 
    } else if(request.action === proto.api.OpenChannel.Action.CREATE) {
      this.createChannel(request, ref);
    }
  }

  public routeRequest(request: proto.api.Command) {
    if(request.openChan) {
      this.openChannel(request.openChan, request.ref);
    } else if(request.channel == 0){
      if(request.ping) this.send(<proto.api.Command>{pong: {}});
    }else {
      if (!request.channel) {
        return console.error("No channel specified.");
      }
      if (!this.openChannels.has(request.channel)) {
        return console.error("Channel not found.");
      }
      console.log(`Request for channel ${request.channel} received.`);
      this.openChannels.get(request.channel)?.onCommand(request);
    }
  }

  public onCommand(cmd: proto.api.Command) {
    this.routeRequest(cmd);
  }

  private createChannel(request: proto.api.OpenChannel, ref: string) {
    const newId = ++this.client.lastChannelId;
    if(request.service == "gcsfiles" || request.service == "files") {
      this.openChannels.set(newId, 
        new FilesChannel(this.client, newId, request.name)
      );
    } else if(request.service == "chat") {
      this.openChannels.set(newId,
        new ChatChannel(this.client, newId, request.name)
      );
    } else if(request.name.startsWith('ot:') && request.service == "ot") {
      this.openChannels.set(newId, 
        new OTChannel(this.client, newId, request.name)
      );
    } else if (request.service == "dotreplit") {
      this.openChannels.set(newId, 
        new DotReplitChannel(this.client, newId, request.name)
      );
    } else if (request.service == "shellrun2") {
      this.openChannels.set(newId,
        new ShellChannel(this.client, newId, request.name, request.service)
      );
    } else {
      this.openChannels.set(newId, 
        new Channel(this.client, newId, request.name, request.service)
      );
    }
    this.send(<proto.api.Command>{
      openChanRes: <proto.api.OpenChannelRes>{
        id: newId,
        state: proto.api.OpenChannelRes.State.CREATED,
      },
      ref: ref
    });
    this.openChannels.get(newId)?.afterCreate();
    console.log(`Created ${request.service} channel ${request.name} on channel ${newId}`);
  }
}