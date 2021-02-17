const Utils = require('./Utils')

class Curve {
  constructor() {
  }

  setExpression(expression) {
    this.expression = expression
  }

  generatePoints(limits) {
    let x = Utils.arange(limits[0][0], limits[0][1], 0.01)
    let points = []
    x.forEach(e => {
      points.push([
        e,
        this.expression(e)
      ])
    })
    return points
  }

  // will return a list of points coordinates that make the function
  generateLines() {

  }
}

module.exports = Curve
