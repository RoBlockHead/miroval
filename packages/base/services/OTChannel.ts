import Client from '../Client.ts';
import { Channel } from '../Channel.ts';
import proto from "https://esm.sh/@replit/protocol?target=deno";

export class OTChannel extends Channel {
  public linked: boolean;
  public constructor(client: Client, id: number, name: string) {
    super(client, id, name, "ot:miroval.md");
    this.linked = false;
  }
  public afterCreate() {
    this.send(<proto.api.Command>{
      channel: this.id,
      otstatus: {}
    })
  }
  public onCommand(cmd: proto.api.Command) {
    if(cmd.otLinkFile && this.name =="ot:miroval.md") {
      this.linked = true;
      this.send(<proto.api.Command>{
        channel: this.id,
        otLinkFileResponse: <proto.api.OTLinkFileResponse>{
          version: 1,
          linkedFile: <proto.api.File><unknown>{
            type: proto.api.File.Type.REGULAR,
            path: "miroval.md",
            content: btoa(`# Miroval v0.2\n\n### This file is provided by miroval, not goval.\n\n### Current Repl: @${this.client.replToken.repl?.user}/${this.client.replToken.repl?.slug}`)
          }
        },
        ref: cmd.ref,
        session: 1
      });
    } if(cmd.otLinkFile && this.name =="ot:token.md") {
      this.linked = true;
      let tok = this.client.replToken;
      this.send(<proto.api.Command>{
        channel: this.id,
        otLinkFileResponse: <proto.api.OTLinkFileResponse>{
          version: 1,
          linkedFile: <proto.api.File><unknown>{
            type: proto.api.File.Type.REGULAR,
            path: "token.md",
            content: btoa(`# Token Information\n\nissued at ${tok.iat?.seconds}\n\nexpires at${tok.exp?.seconds}\n\ncluster:${tok.cluster}\n\n${(tok.persistence == proto.api.ReplToken.Persistence.PERSISTENT ? "PERSISTENT" : "EPHEMERAL")}\n\nrepl id: ${tok.repl?.id}\n\nrepl language: ${tok.repl?.language}\n\nbucket: ${tok.repl?.bucket}\n\nslug: ${tok.repl?.slug}`)
          }
        },
        ref: cmd.ref,
        session: 1
      });
    }
  }
}