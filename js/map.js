/* global PIXI, Heap */
const map = ` 
xxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxx0000xxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxx0000xxxxxxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxx0000xxxxxxxxxxxx00xx000xxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxx00x00xxxxxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxx00xx0xxxxxxxxxxx00xxxxx00xxxxxxxxxxxxxxxxxxxx
xxxxxxxxxx00xxx000xxxxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxx00xxx0xxxxxxxxxx00xxxxxxx00xxxxxxxxxxxxxxxxxxx
xxxxxxxxx00xxxxxx0000xxxxxxxxxxx0000000xxxxxxxxxxxxxx00xxxx000xxxxxxx00xxxxxx000xxxxxxxxxxxxxxxxxxxx
xxxxxxxx00xxxxxxxxxx0000000000000xxxx00xxxxxxxxxxxxx00xxxxxxx0xxxxxx00xxxxxx00xxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxxxxxx00xxxxxxxxxxxx00xxxxxxxx00000000xxxxxxx0xxxxxxx000xxxxxxxxxxxxx
xxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxxxxx00xxxxxxxxxxx00xxxxxxxx00xxxxxx0xxxxxxx0000xx000x00000xxxxxxxxx
xxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxxxxx00xxxxxxxxx00xxxxxxxxx0xxxxxxx00xxxxxxxxx0000xxxxx00000000xxxx
xxxxxxxxxxxx00xxxxxxxxxxxx0xxxxxxxxxxx00xxxxxxxx00xxxxxxxx00xxxxxxxxx0xxxxxxxxxxxxxxxxxx00000000xxxx
xxxxxxxxxxxxx00xxxxxxxxxxx0xxxxxxxxxxxx00xxxxxx00xxxxxxxxx0xxxxxxxxxx0xxxxxxxxxxxxxxxxxx00000000xxxx
xxxxxxxxxxxxxx00xxxxxxxxxx00xxxxxxxxxxx00xxxxx00xxxxxxxxxx0xxxxxxxxxx0xxxxxxxxxxxxxxxxxx00000000xxxx
xxxxxxxxxxxxxxx00xxxxxxxxxx00xxxxxxxxxxx00xxx00xxxxxxxxx000xxxxxxxxxx0xxxxxxxxxxxxxxxxxxxxxxx00xxxxx
xxxxxxxxxxxxxxxx00xxxxxxxxxx0xxxxxxxxxxx0000000xxxxxxxxx0xxxxxxxxxxxx0xxxxxxxxxxxxxxxxxxxxxxx00xxxxx
xxxxxxxxxxxxxxx00000000000000000000000000000000xxxxxxxxx0xxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxx00xxxxx
x00000000000000000000000000000000000000000xxx00000000000000000000xxxxx00xxxxxxxxxxxxxxxxxxxxx00xxxxx
x00000000000000000000000000000000000000000xxx00xxxxxxxxxxx0xxxxx00xxxxx0xxxxxxxxxxxxxxxxxxxxx00xxxxx
xxxxxxxxxxxxxxxxxx0xxxxxxx0xxxxx0xxxxxxx0000000xxxxxxxxxxx0xxxxxx00xxxx00xxxxxxxxxxxxxxxxxxxx00xxxxx
xxxxxxxxxxxxxxxxxx000000000xxxxx0xxxxxxx0000000xxxxxxxxxxx0xxxxxxx00xxxx0xxxxxxxxxxxxxxxxxxxx00xxxxx
xxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxx0xxxxxxxx000xxxxxxxxxxxxxx00xxxxxxx00xxx0xxxxxxxxxxxxxxxxxxxx00xxxxx
xxxxxxxxxxxxxxxxxx00xxxxxxxxxxxx0xxxxxxxx000xxxxxxxxxxxxxxx0xxxxxxxx00xx00xxxxxxxxxxxxxxxxxxx000000x
xxxxxxxxx0xxxxxxxxx00xxxxxxxxxxx0xxxxxxxx000xxxxxxxxxxxxxxx00xxxxxxxx00xx00xxxxxxxxxxxxxxxxxxxxx0000
xxxxxxxx000xxxxxxxxx0xxxxxxxxxxx00000000000xxxxxxxxxxxxxxxxx0xxxxxxxxx00xx0xxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxx00000xxxxxxxx0xxxxxxx0xxxxxxxxxxx00xxxxxxxxxxxxxxxxxx00xxxxxxxxx00000xxxxxxxxxxxxxxxxxxxxxxxx
xxxxxx0000000xxxxxxx0xxxxxxx0xxxxxxxxxxx00xxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxx0xxxxxxxxxxxxxxxxxxxxxxxx
xxxxx000000000xxxxxx0xxxxxxx00000000000000xxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxxx
000000000000000xxxxx0xxxxxxxxxxxxxxxxxx000xxxxxxxxxxxxxxxxxxx00xxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxx
0xxxxx0000000000xxxx00xxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxx0xxxxxxxxxxxxxxxxxxxxxx
0xxxxxx00000000xxxxxx0xxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxx
0xxxxxxxx00000xxxxxxx0xxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxx0xxxxxxxxxxxxxxxxxxxxx
0xxxxxxxxxx00xxxxxxxx0xxxxxxxxxxxxxxxx000xxxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxx
0xxxxxxxxxxx0xxxxxxx00xxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxxxxxxx
0xxxxxxxxxxxxxxxxxx00xxxxxxxxxxxxx000000xxxxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxxx00xxxx000000000000000
0xxxxxxxxxxxxxxxx000xxxxxxxxxxxxxx0x00xxxxxxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxxxx000000xxxxxxxxxxxxxx
0xxxxxxxxxxxxxx000x000000xxxxxx0000x00xxxxxxxx0xxxxxxxxxxxxxxx000000xxxxxxx0000000xxxxxxxxxxxxxxxxxx
0xxxxxxxxxxxx000xxxxxxx000000000xxxx00xxxxxxxx00xxxxxxxxx000000xxxx00xxx0000xxxxx0xxxxxxxxxxxxxxxxxx
0xxxxxxxxxxx00xxxxxxxxxxxxxx0xxxxxx00xxxxxxxxxx0xxxxxxxx00xxxx0xxxxx00000xxxxxxxx0xxxxxxxxxxxxxxxxxx
0000000000000xxxxxxxxxxxx000000xxxx00xxxxxxxxxx0xxxxxxxx0xxxxx0xxxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxx
xxxxxxxxx00xxxxxxxxxxxxxx0xxxx0xxx00xxxxxxxxxxx0000000000000000xxxxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxx
xxxxxxxxx00xxxxxxxxxxxxx0xxxxx0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxxx
`

var lines = map.match(/^[a-z0-9A-Z]*$/gm)

var Node = function (value, x, y) {
  this.id = this.idFromPos(x, y)
  this.x = x
  this.y = y
  this.value = value
}

Node.prototype.idFromPos = function (x, y) {
  return x + '-' + y
}

Node.prototype.cost = function () {
  switch (this.value) {
    case 'x':
      return Infinity
    case '0':
      return 1
  }
}

var Map = function (buffer) {
  this.nodes = []

  for (var i = 0; i < buffer.length; i++) {
    for (var j = 0; j < buffer[i].length; j++) {
      this.nodes.push(new Node(buffer[i][j], j, i))
    }
  }
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

Map.prototype.openNeighbor = function (node) {
  var nodes = []

  for (var i = 0; i < this.nodes.length; i++) {
    var n = this.nodes[i]
    if (n.id === n.idFromPos(node.x - 1, node.y) ||
      n.id === n.idFromPos(node.x + 1, node.y) ||
      n.id === n.idFromPos(node.x, node.y + 1) ||
      n.id === n.idFromPos(node.x, node.y - 1)) {
      nodes.push(this.nodes[i])
    }
  }

  return nodes
}

Map.prototype.distanceCost = function (a, b) {
  var dx = Math.abs(a.x - b.x)
  var dy = Math.abs(a.y - b.y)
  return a.cost() * Math.max(dx, dy) + (b.cost() - a.cost()) * Math.min(dx, dy)
}

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

    var neighbor = this.openNeighbor(current)
    for (var i = 0; i < neighbor.length; i++) {
      if (neighbor[i].cost() === Infinity) {
        continue
      }
      var newCost = gScore[current.id] + neighbor[i].cost()
      if ((!(neighbor[i].id in gScore)) || newCost < gScore[neighbor[i].id]) {
        open.push([this.distanceCost(neighbor[i], b), neighbor[i]])
        cameFrom[neighbor[i].id] = current
        gScore[neighbor[i].id] = newCost
      }
    }
  }

  return []
}

var MapDraw = function (map) {
  this.map = map
  this.canvas = new PIXI.Application(1500, 615)
  this.canvas.stage.interactive = true
}

MapDraw.prototype.place = function (dom) {
  dom.appendChild(this.canvas.view)
}

MapDraw.prototype.node = function (node) {
  var graphic = new PIXI.Graphics()
  var color = 0xFFFFFF

  switch (node.value) {
    default: break
    case '0': color = 0x000088; break
    case 'x': color = 0x000000; break
  }

  graphic.beginFill(color)
  graphic.drawRect(node.x * 15, node.y * 15, 15, 15)
  graphic.endFill()

  return graphic
}

MapDraw.prototype.run = function () {
  this.nodes = {}
  for (var i = 0; i < this.map.nodes.length; i++) {
    var graphic = this.node(this.map.nodes[i])
    graphic.interactive = true
    graphic.on('pointertap', this.events.nodeSelect.bind(this))
    this.nodes[this.map.nodes[i].id] = { g: graphic, i: i }
    this.canvas.stage.addChild(graphic)
  }
}

MapDraw.prototype.events = {
  nodeSelect: function (event) {
    var graphic = event.target
    var nodeid
    for (var k in this.nodes) {
      if (this.nodes[k].g === graphic) {
        nodeid = k
        break
      }
    }
    var mNode = this.map.nodes[this.nodes[nodeid].i]

    if (!this.start) {
      graphic.clear()
      graphic.beginFill(0x880000)
      graphic.drawRect(mNode.x * 15, mNode.y * 15, 15, 15)
      graphic.endFill()
      this.start = mNode
    } else {
      var nodes = this.map.pathTo(this.start, mNode)
      for (var i = 0; i < nodes.length; i++) {
        graphic = this.nodes[nodes[i].id].g
        graphic.clear()
        graphic.beginFill(0x880000)
        graphic.drawRect(nodes[i].x * 15, nodes[i].y * 15, 15, 15)
        graphic.endFill()
      }
      this.start = null
    }
  }
}

var currentMap = new Map(lines)
var draw = new MapDraw(currentMap)
draw.place(document.body)
draw.run()
