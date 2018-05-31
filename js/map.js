/* global PIXI */
const map = ` 
xxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxx0000xxxxxxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxx0000xxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxx00x00xxxxxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxx00xx0xxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxx00xxx000xxxxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxx00xxx0xxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxx00xxxxxx0000xxxxxxxxxxx0000000xxxxxxxxxxxxxx00xxxx000xxxxxxx00xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxx00xxxxxxxxxx0000000000000xxxx00xxxxxxxxxxxxx00xxxxxxx0xxxxxx00xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxxxxxx00xxxxxxxxxxxx00xxxxxxxx00000000xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxxxxx00xxxxxxxxxxx00xxxxxxxxx0xxxxxx0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxxxxx00xxxxxxxxx00xxxxxxxxx0xxxxxxx00xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxx00xxxxxxxxxxxx0xxxxxxxxxxx00xxxxxxxx00xxxxxxxxx0xxxxxxxxx0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxx00xxxxxxxxxxx0xxxxxxxxxxxx00xxxxxx00xxxxxxxxx0xxxxxxxxxx0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxx00xxxxxxxxxxx0xxxxxxxxxxx00xxxxx00xxxxxxxxxx0xxxxxxxxxx0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxx00xxxxxxxxxx0xxxxxxxxxxxx00xxx00xxxxxxxxxx0xxxxxxxxxxx0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxx00xxxxxxxxxx0xxxxxxxxxxx0000000xxxxxxxxx0xxxxxxxxxxxx0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxx00000000000000000000000000000000xxxxxxxxx0xxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
x00000000000000000000000000000000000000000xxx00000000000000000xxxxxxxx00xxxxxxxxxxxxxxxxxxxxxxxxxxxx
x00000000000000000000000000000000000000000xxx00xxxxxxxxxxx0xxxxxxxxxxxx0xxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxx0xxxxxxx0xxxxx0xxxxxxx0000000xxxxxxxxxxx0xxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxx000000000xxxxx0xxxxxxx0000000xxxxxxxxxxx0xxxxxxxxxxxxx0xxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxx0xxxxxxxx000xxxxxxxxxxxxxx0xxxxxxxxxxxxx0xxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxx0xxxxxxxx000xxxxxxxxxxxxxxx0xxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxx0xxxxxxxx000xxxxxxxxxxxxxxx0xxxxxxxxxxxxx0xxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxx00000000000xxxxxxxxxxxxxxxxx0xxxxxxxxxxxxx0xxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxx0xxxxxxx0xxxxxxxxxxx00xxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxx0xxxxxxx0xxxxxxxxxxx00xxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxx0xxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxx0xxxxxxx00000000000000xxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxxx
xxxxxx0000xxxxxxxxxx0xxxxxxxxxxxxxxxxxx000xxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxx0xxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxx0xxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxxx000xxxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxx000000xxxxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxx0x00xxxxxxxxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxx00x000000xxxxxx0000x00xxxxxxxx0xxxxxxxxxxxxxxx0xxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxx00xxxxxxxxx000000xxxxx00xxxxxxxx00xxxxxxxxxxxxxx0xxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxxxxx
xxxxxxxxxxxx00xxxxxxxxxxxxxx0xxxxxx00xxxxxxxxxx0xxxxxxxxxxxxxx0xxxxxxxxxxxxxxxxxx0xxxxxxxxxxxxxxxxxx
000000000000xxxxxxxxxxxxx000x00xxxx00xxxxxxxxxx0xxxxxxxxxxxxxx0xxxxxxxxxxxxxxxxxx00xxxxxxxxxxxxxxxxx
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
  var closed = {}
  var open = []
  var gScore = {}
  var fScore = {}
  var cameFrom = {}

  if (a.cost() === Infinity || b.cost() === Infinity) {
    return []
  }

  open = [ a ]
  gScore[a.id] = a.cost()
  while (open.length > 0) {
    var cId = 0
    var current = open[cId]
    for (var i = 0; i < open.length; i++) {
      if ((!isNaN(fScore[current.id]) ? fScore[current.id] : Infinity) > (!isNaN(fScore[open[i].id]) ? fScore[open[i].id] : Infinity)) {
        current = open[i]
        cId = i
      }
    }

    /* Goal reached */
    if (current.id === b.id) {
      var path = [ current ]
      while (cameFrom[current.id]) {
        current = cameFrom[current.id]
        path.push(current)
      }
      return path
    }

    open.splice(cId, 1)
    closed[current.id] = current

    var neighbor = this.openNeighbor(current)
    for (i = 0; i < neighbor.length; i++) {
      if (closed[neighbor[i].id]) {
        continue
      }

      var inOpen = false
      for (var j = 0; j < open.length; j++) {
        if (open[j].id === current.id) {
          inOpen = true
        }
      }
      if (!inOpen) {
        open.push(neighbor[i])
      }

      var t1 = (!isNaN(gScore[current.id]) ? gScore[current.id] : Infinity) + neighbor[i].cost()
      var t2 = gScore[neighbor[i].id] ? gScore[neighbor[i].id] : Infinity
      if (t1 >= t2) {
        continue
      }

      cameFrom[neighbor[i].id] = current
      gScore[neighbor[i].id] = t1
      fScore[neighbor[i].id] = t1 + this.distanceCost(neighbor[i], b)
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
