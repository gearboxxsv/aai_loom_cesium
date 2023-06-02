import simpleDDP from 'simpleddp'
import { simpleDDPLogin } from 'simpleddp-plugin-login'
import ws from 'isomorphic-ws'

let opts = {
  endpoint: 'wss://airmap.loom.aero/websocket',
  SocketConstructor: ws,
  reconnectInterval: 5000
}
export const server = new simpleDDP(opts, [simpleDDPLogin])
