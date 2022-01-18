import Client from '../Client.ts';
import { Channel } from '../Channel.ts';
import proto from "https://esm.sh/@replit/protocol?target=deno";

export class FilesChannel extends Channel {
  public constructor(client: Client, id: number, name: string) {
    super(client, id, name, "gcsfiles");
  }
  public onCommand(cmd: proto.api.Command) {
    if(cmd.readdir) {
      this.send(<proto.api.Command>{
        channel: this.id,
        files: <proto.api.Files>{
          files: [
            <proto.api.File>{
              path: "miroval.md",
            }
          ]
        },
        ref: cmd.ref
      });
    } else {
      this.send(<proto.api.Command>{
        channel: this.id,
        ok: {}
      })
    }
  }
}