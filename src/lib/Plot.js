const Two = require("two.js").default

/**
 * Api needed for plot
 * addFunction()
 * plot([x], [y])
 * scatter()
 * update()
 * 
 */

class Plot {
  constructor(canvasContainerId, width = 200, height = 400) {
    this.canvasContainer = document.getElementById(canvasContainerId)
    this.limits = [[-1, 1], [-1, 1]] // x and y limits of the graph
    this.scale = 1 // 1 is 400 pixels
    this.rangeX = 2
    this.rangeY = 2
    this.curves = []
    this.centerPoint = [0, 0]

    // we will compute using the limits using the center point and height
    // how much in mm is the width
    // on sait que 400 pixels coorespond à 5 mm
    // donc         ? pixels correspond à (?*5)/400
    this.setLayout(width, height)
    
    // a range of 2 is 200
    // a range
    this.gridSpacing = 0.5
    this.two = new Two({
      width,
      height,
      autostart: true
    }).appendTo(this.canvasContainer)
  }

  setLayout(width, height) {
    this.canvasWidth = width
    this.canvasHeight = height
    let xLim = (this.canvasWidth*5/400)/2
    let yLim = (this.canvasHeight*5/400)/2
    this.setLimits([
      [
        -xLim,
        xLim
      ],
      [
        -yLim,
        yLim
      ]
    ])
  }

  zoom(factor, pivotPoint) {
    let currentLimits = this.getLimits()
    console.log('old: ' , currentLimits)
    let newLimits = [
      [
        currentLimits[0][0]+factor,
        currentLimits[0][1]-factor
      ],
      [
        currentLimits[1][0]+factor,
        currentLimits[1][1]-factor
      ]
    ]
    console.log('new: ', newLimits)
    this.setLimits(newLimits)
  }

  // convert a X millimeter coordinate to a X pixel coordinate
  toX(x) { 
    /*return (
      (Math.abs(this.limits[0][0])+x) *
      (this.scale*this.canvasWidth/this.rangeX)
    )*/
    return (x-this.limits[0][0])*(this.canvasWidth/this.rangeX)
  }

  // convert a Y millimeter coordinate to a Y pixel coordinate
  toY(y) {
    /*return (
      (Math.abs(this.limits[1][0])-y) *
      (this.scale*this.canvasHeight/this.rangeY)
    )*/
    return (y-this.limits[1][0])*(this.canvasHeight/this.rangeY)
  }

  // convert a X pixel coordinate to a X millimeter coordinate
  fromX(x) {
    return (x/(this.scale*this.canvasWidth/this.rangeX))-
      (Math.abs(this.limits[0][0]))
  }
  
  // convert a Y pixel coordinate to a Y millimeter coordinate
  fromY(y) {
    return -(y/(this.scale*this.canvasHeight/this.rangeY))+
      (Math.abs(this.limits[1][0]))
  }

  setXLim(min, max) {
    this.setLimits([[min, max], this.limits[1]])
  }

  setYLim(min, max) {
    this.setLimits([this.limits[0], [min, max]])
  }

  getLimits() {
    return this.limits
  }

  getRangeX () {
    return Math.abs(this.limits[0][0]-this.limits[0][1])
  }

  getRangeY () {
    return Math.abs(this.limits[1][0]-this.limits[1][1])
  }

  setLimits(limits) {
    this.limits = limits
    this.rangeX = this.getRangeX()
    this.rangeY = this.getRangeY()
  }

  convertCoordinates(x, y = []) {
    if (Array.isArray(x)) {
      let tmp = x
      x = tmp[0]
      y = tmp[1]
    }
    // 
    // 2 = 200
    // range = 
    // (range * 100)
    
    // return [
    //   ((this.rangeX/2)+x)*(this.scale*this.canvasWidth/this.rangeX),
    //   ((this.rangeY/2)-y)*(this.scale*this.canvasHeight/this.rangeY)
    // ]
    return [
      this.toX(x),
      this.toY(y)
    ]
    // sens inverse pour en entré x et y
    // [(x/scale)-(rangeX/2), -(y/scale)+(rangeY/2)]
  }

  addLine(a, b, options = {}) {
    a = this.convertCoordinates(a)
    b = this.convertCoordinates(b)
    let line = this.two.makeLine(a[0], a[1], b[0], b[1])
    if (options.color != null) {
      line.stroke = options.color
    }
    if (options.width != null) {
      line.linewidth = options.width
    }
  }

  makeGird() {
    let lowerXLimit = Math.floor(this.limits[0][0])
    let upperXLimit = Math.ceil(this.limits[0][1])
    let lowerYLimit = Math.floor(this.limits[1][0])
    let upperYLimit = Math.ceil(this.limits[1][1])
    let x = lowerXLimit
    let isZero = (t) => Math.abs(t)<10e-5 || Math.abs(t)<10e-5
    let options = (t) => ({
      width: isZero(t) ? 3 : 1,
      color: 'rgba(0, 0, 0, 0.5)'
    })
    while (x <= upperXLimit) {
      this.addLine(
        [x, lowerYLimit],
        [x, upperYLimit],
        options(x)
      )
      x += this.gridSpacing
    }
    let y = lowerYLimit
    while (y <= upperYLimit) {
      this.addLine(
        [lowerXLimit, y],
        [upperXLimit, y],
        options(y)
      )
      y += this.gridSpacing
    }
  }

  getElement() {
    return this.canvasContainer
  }

  addCurve(curve) {
    this.curves.push(curve)
  }

  drawCurve(curve) {
    // plot the curve
    let points = curve.generatePoints(this.limits)
    let anchors = points.map(
      (p) => {
        let c = this.convertCoordinates(p)
        return new Two.Anchor(c[0], c[1])
      })
    let path = this.two.makeCurve(anchors, true)
    path.stroke = 'red'
    path.linewidth = 2
    path.fill = 'transparent'
  }

  getCurves() {
    return this.curves
  }

  clear() {
    this.two.clear()
  }

  draw() {
    this.clear()
    this.makeGird()

    this.curves.forEach((c) => {
      this.drawCurve(c)
    })

    this.two.update()
  }
}

module.exports = Plot