import Client from './Client.ts';
import { parseToken } from './utils.ts';
import { ChannelZero } from './services/ChannelZero.ts';
import proto from "https://esm.sh/@replit/protocol?target=deno";
import { Channel } from "./Channel.ts";

// const repls = new Map<string, Repl>();
const clients = new Map<number, Client>();

let clientId = 0;

const doHandshake = async (ws: WebSocket, token: proto.api.ReplToken) => {
  let cmd: proto.api.Command = <proto.api.Command>{
    bootStatus: {
      stage: proto.api.BootStatus.Stage.HANDSHAKE,
    }
  };
	await ws.send(proto.api.Command.encode(cmd).finish());
  if(!cmd.bootStatus) return;
  cmd.bootStatus.stage = proto.api.BootStatus.Stage.ACQUIRING;
  await ws.send(proto.api.Command.encode(cmd).finish());
  cmd.bootStatus.stage = proto.api.BootStatus.Stage.PROXY;
  await ws.send(proto.api.Command.encode(cmd).finish());
  cmd = <proto.api.Command>{
    containerState: {
      state: proto.api.ContainerState.State.READY,
    },
    bootStatus: {
      stage: proto.api.BootStatus.Stage.COMPLETE,
    }
  }
  await ws.send(proto.api.Command.encode(cmd).finish());
  cmd = <proto.api.Command>{
    toast: {
      text: "miroval initialized (v0.2)",
    }
  }
  await ws.send(proto.api.Command.encode(cmd).finish());
  cmd = <proto.api.Command>{
    toast: {
      text: `Connected to @${token.repl?.user}/${token.repl?.slug}`
    }
  }
  await ws.send(proto.api.Command.encode(cmd).finish());
  console.log("Completed Handshake.")
}
function wsHandler(ws: WebSocket, token: proto.api.ReplToken) {
  const id = ++clientId;
  clients.set(id, new Client(ws, token));
  const thisClient = clients.get(id);
  if (!thisClient) return;
  

  ws.onopen = () => {
    doHandshake(ws, token);
    console.log("Client connected");
    thisClient.channel0 = new ChannelZero(thisClient);
  };
  ws.onmessage = (e) => {
    const thisClient = clients.get(id);
    if (!thisClient) return;
    if (e.data instanceof ArrayBuffer) {
      const msg = proto.api.Command.decode(new Uint8Array(e.data), e.data.byteLength);
      thisClient.channel0?.onCommand(msg);
    } else {
      console.log("non-arraybuffer data!");
    }
  };
  ws.onclose = () => {
    clients.delete(id);
    console.log("Client disconnected");  
  };
}

function requestHandler(req: Deno.RequestEvent) {
  const url = new URL(req.request.url);
  if (req.request.method === "GET" && url.pathname === "/") {
    req.respondWith(new Response("miroval v0.1"));
  } else if (req.request.method === "GET" && url.pathname.startsWith('/wsv2')) {
    console.log("Crosis Connection");
    const { socket, response } = Deno.upgradeWebSocket(req.request);
    wsHandler(socket, parseToken(url.pathname.split('/')[2]));
    req.respondWith(response);
  }
}

const server = Deno.listen({ port: parseInt(Deno.env.get("PORT") || "8080")});
console.log("miroval starting on port 8080....");

for await (const conn of server) {
  (async () => {
    const httpConn = Deno.serveHttp(conn);
    for await (const requestEvent of httpConn) {
      requestHandler(requestEvent);
    }
  })();
}