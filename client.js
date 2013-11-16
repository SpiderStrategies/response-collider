var websocket = require('websocket-stream')
  , ws = websocket('ws://localhost:8080')

ws.on('data', function (d) {
  var p = document.createElement('p')
  p.appendChild(document.createTextNode(d))
  document.getElementById('output').appendChild(p)
})
