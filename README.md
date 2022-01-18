# miroval 

## Mission
Welcome to miroval, a project aimed at developing an open-source code evaluation server compatible with Replit's [goval protocol](https://github.com/replit/protocol). 

## This Repository

You may be asking yourself what in the world is going on in this repository, so I'll break it down.

The `packages` directory contains the modules of this project:

### `base` Evaluation Server

The base evaluation server handles initial websocket connections and communicates with `conmiro`

This evaluation server is a Deno websocket server. Deno was evaluated to be the most sensible solution for a performant server with access to the latest Replit Protocol definitions, thanks to the [esm.sh](https://esm.sh) service for conversion of npm modules to be Deno-compatible.

### `conmiro` Container Manager

The conmiro container manager is the module which handles connections to docker containers.

Currently, conmiro is implemented in Go, but this is preliminary likely to change.

## Roadmap

 - [x] Connect to Replit Client
 - [x] Send messages to Replit Client
 - [ ] Connect to Docker Container in standalone mode
 - [ ] Simple PTY Service
 - [x] Read-Only Filesystem Service
 - [ ] Authentication
 - [ ] Custom Client
 - [ ] Token Issuing