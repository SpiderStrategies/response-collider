var WebSocketServer = require('ws').Server
  , websocket = require('websocket-stream')
  , http = require('http')
  , ecstatic = require('ecstatic')(__dirname)
  , es = require('event-stream')

var server = http.createServer(ecstatic).listen(8080)
  , wss = new WebSocketServer({server: server})

wss.on('connection', function (ws) {
  process.stdin.pipe(es.split()).pipe(websocket(ws))
})
