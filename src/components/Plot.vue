<template>
  <div 
    class="plot-content"
    :class="{'pointer-grabbing': translating}" 
  >
    <div :id="'canvas-'+plotId" />
    <v-btn @click="home" fab absolute bottom left class="mb-15 ml-3 white--text" color="indigo">
      <v-icon>mdi-home</v-icon>
    </v-btn>
    <div class="plot-meta">
      <div>
        Cursor: {{ mousePosition[0] }} ; {{ mousePosition[1] }}
      </div>
    </div>
  </div>
</template>

<script>
import Plot from '../lib/Plot'
import Utils from '../lib/Utils'
import Curve from '../lib/Curve'

export default {
  props: {
    layout: {
      type: Array
    }
  },
  components: {
  },
  data () {
    return {
      container: null,
      plotId: '',
      mousePosition: [0, 0],
      translating: false,
      translateSamples: 0,
      lastTranslateSample: []
    }
  },
  created () {
    this.plotId = Utils.randStr()
    window.changeLimits = this.changeLimits

    setTimeout(() => {
        if (this.container === null) {
          this.init()
        }
    }, 500)
  },
  mounted () {
  },
  methods: {
    init () {
      if (this.container !== null) {
        this.container.innerHTML = ''
      }
      let plot = new Plot(
        "canvas-" + this.plotId,
        this.layout[0],
        this.layout[1]
      )
      this.plot = plot
      // plot.setXLim(-1, 1)
      // plot.setYLim(-1, 1)
      //plot.addLine([0, 0], [1, 1])
      // plot.addLine([0, 0], [0, 1])
      // plot.addLine([0, 0], [-1, -1])
      let curve = new Curve()
      curve.setExpression((x) => -Math.exp(x))
      plot.addCurve(curve)
      let curve2 = new Curve()
      curve2.setExpression((x) => -Math.sin(x))
      plot.addCurve(curve2)
      plot.draw()

      this.container = plot.getElement()
      this.container.onmousemove = this.onMouseMouve 
      this.container.onscroll = this.onScroll

      this.container.addEventListener("mousewheel", this.onMouseWheel)
      this.container.onmousedown = this.onMouseDown
      this.container.onmouseup = this.onMouseUp

    },
    changeLimits (x, y) {
      this.plot.setLimits([
        x,
        y
      ])
      this.plot.draw()
    },
    home () {
      this.plot.setLayout(this.plot.canvasWidth, this.plot.canvasHeight)
      this.plot.draw()
    },
    onMouseDown (event) {
      this.translating = true
      this.translateSamples = 0
    },
    onMouseUp(event) {
      this.translating = false
      this.translateSamples = 0
    },
    onMouseWheel (event) {
      let factor = Math.sign(event.deltaY)*-1
      console.log('zooming with ', factor)
      this.plot.zoom(factor, this.mousePosition)
      this.plot.draw()
    },
    onMouseMouve (event) {
      //if (this.paused) return
      let mouseX, mouseY = 0
      let offsetX = this.container.offsetLeft
      let offsetY = this.container.offsetTop
      let element = this.container.offsetParent
      while(element != null) {
        offsetX = parseInt(offsetX) + parseInt(element.offsetLeft)
        offsetY = parseInt(offsetY) + parseInt(element.offsetTop)
        element = element.offsetParent
      }
      mouseX = this.plot.fromX(event.pageX - offsetX)
      mouseY = this.plot.fromY(event.pageY - offsetY)
      
      this.mousePosition = [parseFloat(mouseX.toFixed(3)), parseFloat(mouseY.toFixed(3))]

      if (this.translating) {
        if (this.translateSamples === 0) {
          this.lastTranslateSample = this.mousePosition
        }
        this.translateSamples += 1
        if (this.translateSamples > 1) {
          let factor = 5
          // difference between the last sample and the current sample
          let XTranslation = factor*(this.lastTranslateSample[0]-this.mousePosition[0])
          let YTranslation = -factor*(this.lastTranslateSample[1]-this.mousePosition[1])
          
          // we move the map
          let currentLimits = this.plot.getLimits()
          this.plot.setLimits([
            [
              currentLimits[0][0]+XTranslation,
              currentLimits[0][1]+XTranslation
            ],
            [
              currentLimits[1][0]+YTranslation,
              currentLimits[1][1]+YTranslation
            ]
          ])
          this.plot.draw()

          this.translateSamples = 0
        }
      }
    }
  }
}
</script>


<style>

.plot-content {
  position: relative;
  cursor: grab;
}

.plot-content.pointer-grabbing {
  cursor: grabbing !important;
}

.plot-meta {
  position: absolute;
  bottom: 0;
  right: -3px;
  width: 15em;
  z-index: 999;
  padding: .5em;
  padding: .5em 1em;
  margin-bottom: .5em;
  display: flex;
  justify-content: flex-start;
  font-weight: bold;
  color: white;
  background-color: rgba(67,67,67,0.8);
}
</style>