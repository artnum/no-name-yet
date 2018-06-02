/* global PIXI, Heap, MAP */
var lines = MAP.match(/^[^\s]+$/gm)
var Node = function (value, x, y) {
  this.id = this.idFromPos(x, y)
  this.x = x
  this.y = y
  this.value = value
}

Node.prototype.idFromPos = function (x, y) {
  return x + '-' + y
}

Node.prototype.cost = function (relativeTo, previous) {
  var baseCost = Infinity

  switch (this.value) {
    case 'x':
      return baseCost
    case '0': case '1': case '2': case '3': case '4': case '5': case '6': case '7': case '8': case '9':
      baseCost = Number(this.value) + 10
  }

  if (!relativeTo) {
    return baseCost
  }

  /* turning is more expensive */
  var turning = false
  var dx = this.x - relativeTo.x
  var dy = this.y - relativeTo.y
  var cos = Math.cos(Math.atan2(dy, dx))

  if (cos !== 0 || cos !== 1) {
    baseCost++
    turning = true
  }

  /* If we turn but we previously turned, it's ok */
  if (turning && previous) {
    dx = this.x - previous.x
    dy = this.y - previous.y
    cos = Math.cos(Math.atan2(dy, dx))

    if (cos !== 0 || cos !== 1) {
      baseCost--
    }
  }

  return baseCost
}

var Map = function (buffer) {
  this.nodes = []
  /* Assume map is squared */
  this.width = buffer[0].length
  this.height = buffer.length

  for (var i = 0; i < buffer.length; i++) {
    for (var j = 0; j < buffer[i].length; j++) {
      this.nodes.push(new Node(buffer[i][j], j, i))
    }
  }
}

Map.prototype.index = function (x, y) {
  if (x < 0 || x < 0) { return -1 }
  if (x > this.width || y > this.height) { return -1 }
  return x + (y * this.width)
}

Map.prototype.openNodes = function () {
  var oNodes = []

  for (var i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i].cost() < Infinity) {
      oNodes.push(this.nodes[i])
    }
  }

  return oNodes
}

Map.prototype.randomNode = function () {
  var oNodes = this.openNodes()
  return oNodes[Math.floor(Math.random() * oNodes.length)]
}

Map.prototype.neighbors = function (node) {
  var nodes = []
  var idx = [
    this.index(node.x, node.y - 1),
    this.index(node.x, node.y + 1),
    this.index(node.x + 1, node.y),
    this.index(node.x + 1, node.y - 1),
    this.index(node.x + 1, node.y + 1),
    this.index(node.x - 1, node.y),
    this.index(node.x - 1, node.y - 1),
    this.index(node.x - 1, node.y + 1)
  ]

  for (var i = 0; i < idx.length; i++) {
    if (idx[i] !== -1) {
      nodes.push(this.nodes[idx[i]])
    }
  }

  return nodes
}

Map.prototype.distanceCost = function (a, b) {
  var dx = Math.abs(a.x - b.x)
  var dy = Math.abs(a.y - b.y)
  return a.cost(b) * Math.max(dx, dy) + (b.cost(a) - a.cost(b)) * Math.min(dx, dy)
}

/* A* Path Finding */
Map.prototype.pathTo = function (a, b) {
  var open = new Heap(function (a, b) { return b[0] - a[0] })
  var gScore = {}
  var cameFrom = {}

  if (a.cost() === Infinity || b.cost() === Infinity) {
    return []
  }

  open.push([this.distanceCost(a, b), a])
  gScore[a.id] = 0
  while (!open.isEmpty()) {
    var current = open.pop()[1]

    /* Goal reached */
    if (current.id === b.id) {
      var path = []
      while (current.id !== a.id) {
        path.push(current)
        current = cameFrom[current.id]
      }
      return path.reverse()
    }

    var neighbor = this.neighbors(current)
    for (var i = 0; i < neighbor.length; i++) {
      if (neighbor[i].cost() === Infinity) {
        continue
      }
      var newCost = gScore[current.id] + neighbor[i].cost(current, cameFrom[current.id])
      if ((!(neighbor[i].id in gScore)) || newCost < gScore[neighbor[i].id]) {
        open.push([this.distanceCost(neighbor[i], b), neighbor[i]])
        cameFrom[neighbor[i].id] = current
        gScore[neighbor[i].id] = newCost
      }
    }
  }

  return []
}

Map.prototype.findNode = function (x, y) {
  var n = new Node('x', x, y)
  for (var i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i].id === n.id) {
      return this.nodes[i]
    }
  }
  return null
}

var MapDraw = function (map) {
  this.map = map
  this.nodes = {}
  this.canvas = new PIXI.Application({ width: 1600, height: 900 })
  this.canvas.stage.interactive = true
  this.canvas.stage.on('click', this.events.mapClick.bind(this))
}

MapDraw.prototype.place = function (dom) {
  dom.appendChild(this.canvas.view)
}

MapDraw.prototype.node = function (node, graphic) {
  var color = 0x800000

  switch (node.value) {
    default: break
    case '1': color = 0x803400; break
    case '2': color = 0x805900; break
    case '3': color = 0x806d00; break
    case '4': color = 0x808000; break
    case '5': color = 0x467600; break
    case '6': color = 0x005b2a; break
    case '7': color = 0xff0000; break
    case '8': color = 0x0a1b57; break
    case '9': color = 0x1a0b58; break
    case 'x': color = 0xFFFFFF; break
  }

  graphic.lineStyle(0, 0x0000FF, 1)
  graphic.beginFill(color)
  graphic.drawRect(node.x, node.y, 1, 1)
  graphic.endFill()

  return graphic
}

MapDraw.prototype.run = function () {
  this.drawMap()
  this.pointer()
}

MapDraw.prototype.drawMap = function () {
  var container = new PIXI.Container()
  var graphic = new PIXI.Graphics()

  /* Pixels */
  for (var i = 0; i < this.map.nodes.length; i++) {
    this.node(this.map.nodes[i], graphic)
    this.nodes[this.map.nodes[i].id] = { g: graphic, i: i }
  }
  if (this.graphicMap) {
    this.canvas.stage.removeChild(this.graphicMap)
  }
  container.addChild(graphic)

  var texture = PIXI.Texture.fromImage('data/interdicsion.png')
  var logo = new PIXI.Sprite(texture)
  logo.anchor.set(0.5)
  logo.x = this.canvas.screen.width - (100 + (logo.width / 2))
  logo.y = this.canvas.screen.height - (100 + (logo.height / 2))
  container.addChild(logo)

  this.canvas.stage.addChild(container)
  this.graphicMap = container
}

MapDraw.prototype.pointer = function () {
  this.pointer = new PIXI.Sprite(PIXI.Texture.fromImage('data/pointer.png'))
  this.pointer.anchor.set(0.5)
  var start = this.map.randomNode()

  this.pointer.x = start.x
  this.pointer.y = start.y
  this.pointer.road = []
  this.canvas.ticker.add(function (delta) {
    if (this.pointer.road.length <= 0) { return }
    if (!this.pointer.lastMove || Math.abs(this.pointer.lastMove - new Date().getTime()) > 20) {
      var nextPoint = this.pointer.road.shift()

      this.pointer.x = nextPoint.x
      this.pointer.y = nextPoint.y

      this.pointer.lastMove = new Date().getTime()
    }
  }.bind(this))

  this.canvas.stage.addChild(this.pointer)
}

MapDraw.prototype.events = {
  mapClick: function (event) {
    var n = this.map.findNode(Math.round(event.data.global.x), Math.round(event.data.global.y))
    var p = this.map.findNode(this.pointer.x, this.pointer.y)
    console.log(n, p)
    this.pointer.road = this.map.pathTo(p, n)
  }
}

var currentMap = new Map(lines)
var draw = new MapDraw(currentMap)
draw.place(document.body)
draw.run()
