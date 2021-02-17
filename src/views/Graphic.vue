<template>
  <div>
    <v-app-bar
      color="indigo"
      dark
    >
      <v-app-bar-nav-icon></v-app-bar-nav-icon>

      <v-toolbar-title>Graphic</v-toolbar-title>
    </v-app-bar>
    <!-- <div class="layout layout-double">
      <div class="editor-window" id="editor-container" style="height: 100%">
      </div>
      <div class="result-window">
      </div>
    </div> -->
    <v-btn text @click="toggleMode()" class="ma-2" color="indigo">Layout</v-btn>
    <div
      class="splitter"
      :class="{'splitter-mode-horizontal': splitterMode == 'horizontal', 'splitter-hold': splitterBarHold }">
      <div class="splitter-child" id="splitter-child-1">
        <div class="editor-container" id="editor-container" />
      </div>
      <div class="splitter-child graphic-panel" id="splitter-child-2">
        <!-- Where the graphics are shown -->
        <v-card
          style="height:100%"
          outlined
          tile
        >
          <Plot ref="plot" :layout="graphicLayout"/>
        </v-card>
      </div>
      <div class="splitter-bar">
      </div>
    </div>
  </div>
</template>

<script>
import * as monaco from 'monaco-editor'
import Plot from '../components/Plot'

export default {
  components: {
    Plot
  },
  data () {
    return {
      splitterMode: 'vertical',
      firstChildWidth: -1,
      editor: null,
      splitterBar: null,
      splitterParent: null,
      splitterChildren: [],
      splitterBarHold: false,
      holdListeners: [],
      holdReference: [],
      graphicLayout: []
    }
  },
  mounted () {
    this.splitterParent = document.getElementsByClassName('splitter')[0]
    this.splitterChildren = [
      document.getElementById('splitter-child-1'),
      document.getElementById('splitter-child-2')
    ]
    this.splitterBar = document.getElementsByClassName('splitter-bar')[0]
    const container = document.getElementById("editor-container")
    
    this.editor = monaco.editor.create(container, {
      value: [
        'console.log("hello world!")'
      ].join('\n'),
      language: 'javascript',
      minimap: {
        enabled: false
      }
    })
    window.onresize = () => {
      this.resize()
    }
    this.resize()

    let onMouseUp = () => {
      if (!this.splitterBarHold) { return }
      this.splitterBarHold = false
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mousemove', onMouseMove)
    }
    let onMouseMove = (e) => {
      if (!this.splitterBarHold) { return }
      let x = e.clientX
      let y = e.clientY
      if (y < this.splitterParent.offsetTop) {
        return
      }
      if (y > (this.splitterParent.offsetTop + this.splitterParent.clientHeight)) {
        return
      }
      this.resize(x, y)
    }

    this.splitterBar.addEventListener('mousedown', () => {
      if (this.splitterBarHold) { return }
      this.splitterBarHold = true
      this.holdReference = this.width

      document.body.addEventListener('mouseup', onMouseUp)
      document.body.addEventListener('mousemove', onMouseMove)
    })

  },
  methods: {
    resize(x = null, y = null) {
      let parentWidth = this.splitterParent.clientWidth
      let parentHeight = this.splitterParent.clientHeight
      let width = [0, 0]
      let height = [0, 0]
      let barStyle = { top: 0, left: 0, width: 0, height: 0 }
      if (this.splitterMode == 'vertical') {
        width[0] = Math.ceil(x !== null ? x : parentWidth/2)
        width[1] = parentWidth - width[0]
        height[0] = Math.ceil(window.innerHeight-this.splitterParent.offsetTop)
        height[1] = height[0]
        barStyle.width = 10
        barStyle.left = width[0] - Math.ceil(barStyle.width/2)
        barStyle.height = height[0]
      }
      if (this.splitterMode == 'horizontal') {
        width[0] = Math.ceil(parentWidth)
        width[1] = width[0]
        height[0] = Math.ceil(y !== null ? y - this.splitterParent.offsetTop : parentHeight/2)
        height[1] = parentHeight - height[0]
        barStyle.height = 10
        barStyle.width = width[0]
        barStyle.top = height[0] - Math.ceil(barStyle.height/2)
      }
      
      this.splitterChildren[0].style.width = String(width[0]) + 'px'
      this.splitterChildren[0].style.height = String(height[0]) + 'px'
      this.splitterChildren[1].style.width = String(width[1]) + 'px'
      this.splitterChildren[1].style.height = String(height[1]) + 'px'
      this.editor.layout({
        width: width[0],
        height: height[0]
      })
      this.graphicLayout = [width[1], height[1]]
      this.$nextTick(() => {
        this.$refs.plot.init()
      })

      // place the splitter bar
      this.splitterBar.style.width = String(barStyle.width) + 'px'
      this.splitterBar.style.height = String(barStyle.height) + 'px'
      this.splitterBar.style.top = String(barStyle.top) + 'px'
      this.splitterBar.style.left = String(barStyle.left) + 'px'
    },
    toggleMode() {
      if (this.splitterMode == 'horizontal') {
        this.splitterMode = 'vertical'
      } else {
        this.splitterMode = 'horizontal'
      }
      this.resize()
    }
  }
}
</script>

<style>
html, body {
  overflow:hidden;
}
.splitter {
  margin-top: 0em;
  display: flex;
  position: relative;
}
.splitter-mode-horizontal {
  flex-direction: column;
}
.splitter-bar {
  position: absolute;
  background: rgba(255, 0, 0, 0.6);
}
.splitter-hold, .splitter-bar {
  cursor: ew-resize;
}
.splitter-mode-horizontal.splitter-hold, .splitter-mode-horizontal .splitter-bar {
  cursor: ns-resize !important;
}
.editor-container {
  height: 100%;
}
.v-application--wrap {
  min-height: auto;
}
.graphic-panel {
  overflow: none;
}
</style>