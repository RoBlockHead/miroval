import proto from "https://esm.sh/@replit/protocol?target=deno";
import { Channel } from '../Channel.ts';
import Client from "../Client.ts";

export class ShellChannel extends Channel {
  public currentState: proto.api.State = proto.api.State.Stopped;
  private currentText: string = "";
  private currentCursor: number = 0;
  private conmiroConnection: WebSocket;
  constructor(client: Client, id: number, name: string, service: string) {
    super(client, id, name, service);
    this.conmiroConnection = new WebSocket(`ws://localhost:5000/websocket`);
  }
  public afterCreate() {
    this.send(<proto.api.Command>{
      channel: this.id,
      state: this.currentState,
      output: "miroval v0.3 by miroreo\n\uEEA7"
    });
    this.conmiroConnection.onopen = (event: Event) => {
      console.log("conmiro connected.");
    }
    this.conmiroConnection.onmessage = (event: MessageEvent<any>) => {
      console.log(`conmiro: ${event.data}`);
      const data = JSON.parse(event.data);
      this.send(<proto.api.Command>{
        channel: this.id,
        output: data.output,
      });
    }
  }
  public onCommand(cmd: proto.api.Command) {
    if (cmd.input) {
      // let output = "";
      if(this.conmiroConnection.readyState === WebSocket.OPEN) {
        this.conmiroConnection.send(JSON.stringify({input: cmd.input}))
      }
    }
  }
}