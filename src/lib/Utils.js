function clFloat(x) {
  return parseFloat(x.toFixed(14))
}

function arange(a, b, step) {
  let x = a
  let list = []
  while (x < b) {
    list.push(clFloat(x))
    x += step
  }
  return list
}

function randStr() {
  return Math.random().toString(36).substr(2)
}

module.exports = {
  arange,
  clFloat,
  randStr
}
