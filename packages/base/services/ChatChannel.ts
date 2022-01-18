import Client from '../Client.ts';
import { Channel } from '../Channel.ts';
import proto from "https://esm.sh/@replit/protocol?target=deno";

export class ChatChannel extends Channel {
  public constructor(client: Client, id: number, name: string) {
    super(client, id, name, "chat");
    this.send(<proto.api.Command>{
      chatMessage: <proto.api.ChatMessage>{
        text: "miroval connected to chat."
      }
    });
  }
  public onCommand(cmd: proto.api.Command) {
    console.log(`Chat Message: ${cmd.chatMessage?.text}`);
  }
}