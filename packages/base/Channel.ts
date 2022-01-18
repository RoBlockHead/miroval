import Client from './Client.ts';
import proto from "https://esm.sh/@replit/protocol?target=deno";

export class Channel {
  public id: number;
  public name: string;
  public service: string;
  public state?: proto.api.OpenChannelRes.State;
  public client: Client
  public constructor(client: Client, id: number, name: string, service: string) {
    this.id = id;
    this.name = name;
    this.service = service;
    this.client = client;
  }

  public send(cmd: proto.api.Command) {
    this.client.ws.send(proto.api.Command.encode(cmd).finish());
  }

  public onCommand(cmd: proto.api.Command) {
    // do something
  }

  public afterCreate() {
    // do something
  }
}