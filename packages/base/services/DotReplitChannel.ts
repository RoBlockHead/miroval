import Client from '../Client.ts';
import { Channel } from '../Channel.ts';
import proto from "https://esm.sh/@replit/protocol?target=deno";

export default class DotReplitChannel extends Channel {
  public constructor(client: Client, id: number, name: string) {
    super(client, id, name, "dotreplit");
  }
  public onCommand(cmd: proto.api.Command) {
    if (cmd.dotReplitGetRequest){
      this.send(<proto.api.Command>{
        channel: this.id,
        dotReplitGetResponse: <proto.api.DotReplitGetResponse>{
          dotReplit: <proto.api.DotReplit>{}
        }
      });
    }
  }
}