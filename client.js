var websocket = require('websocket-stream')
  , ws = websocket('ws://localhost:8080')

var margin = {top: 0, right: 0, bottom: 60, left: 0}
  , width = 800 - margin.left - margin.right
  , height = 250 - margin.top - margin.bottom

var padding = 6
  , radius = d3.scale.sqrt().domain([0,10000]).range([5, 15])
  , requestScale = d3.scale.linear().domain([0.000, 500.000]).range([800, 3000])
  , color = d3.scale.category20c().range(['#4ac7f5', '#46c5d2', '#42c4b1', '#3ac271', '#36c056', '#31bf27'])
  , id = 0
  , nodes = []

// Each line in the server's log file
ws.on('data', function (line) {
  var now = new Date
    , req = JSON.parse(line)
  req.id = id++
  req.request_time = requestScale(parseFloat(req.request_time))
  req.radius = radius(req.body_bytes_sent)
  req.color = color(req.request)
  req.cx = req.x = 0
  req.cy = req.y = height + Math.random() * 30
  req.start = now.getTime()

  nodes.push(req)
  restart()

  d3.select('#readout').text(req.request)
})

var force = d3.layout.force()
    .nodes(nodes)
    .size([width, height])
    .gravity(0)
    .friction(.6)
    .charge(0)
    .on('tick', tick)
    .start()

var svg = d3.select('#animation').append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
            .append('g')
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

function restart () {
  force.start()
  var now = new Date().getTime()
  for (var i = nodes.length - 1; i >= 0; i--) {
    if (finished(nodes[i], now)) {
      nodes.splice(i,1)
    }
  }

  var circle = svg.selectAll('circle').data(nodes, function (d) { return d.id })

  circle
    .enter().append('circle')
      .attr('cx', function (d) { return d.x })
      .attr('cy', function (d) { return d.y })
      .attr('r', function (d) { return d.radius })
      .style('fill', function (d) { return d.color })

  circle.exit().remove()
}

function tick () {
  // This code needs to run on tick (setInterval, or requestAnimationFrame) // Makes things smooth and update
  svg.selectAll('circle')
      .each(gravity(.2 * force.alpha()))
      .each(collide(.5))
      .attr('cx', function (d) { return d.x })
      .attr('cy', function (d) { return d.y })
}

//  Move nodes toward cluster focus.
function gravity (alpha) {
  return function (d) {
    d.y += (d.cy - d.y) * alpha
    var now = new Date().getTime()
      , pos = width * (now - d.start) / d.request_time
    d.x += (pos - d.x) * alpha
  }
}

// Resolve collisions between nodes.
function collide (alpha) {
  var quadtree = d3.geom.quadtree(nodes)
  return function (d) {
    var r = d.radius + radius.domain()[1] + padding
      , nx1 = d.x - r
      , nx2 = d.x + r
      , ny1 = d.y - r
      , ny2 = d.y + r

    quadtree.visit(function (quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d)) {
        var x = d.x - quad.point.x
          , y = d.y - quad.point.y
          , l = Math.sqrt(x * x + y * y)
          , r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding

        if (l < r) {
          l = (l - r) / l * alpha
          d.x -= x *= l
          d.y -= y *= l
          quad.point.x += x
          quad.point.y += y
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1
    })
  }
}

function finished (transaction, now) {
  return transaction.start + (transaction.request_time || 3000) + 1000 < now
}
