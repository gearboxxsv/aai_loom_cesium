import simpleDDP from 'simpleddp'
const simpleDDPLogin = require('simpleddp-plugin-login').simpleDDPLogin
import ws from 'isomorphic-ws'

let opts = {
  endpoint: 'ws://someserver.com/websocket',
  SocketConstructor: ws,
  reconnectInterval: 5000
}
export const server = new simpleDDP(opts, [simpleDDPLogin])
