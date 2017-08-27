import React, { Component } from 'react';

class Editor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mousedown: false,
      height: 64,
      width: 48,
      pixels: [],
      pixelSize: 0,
      brushPosition: { x: null, y: null }
    };

    this.addPixel        = this.addPixel.bind(this);
    this.draw            = this.draw.bind(this);
    this.drawBrush       = this.drawBrush.bind(this);
    this.drawLayer       = this.drawLayer.bind(this);
    this.handleMousedown = this.handleMousedown.bind(this);
    this.handleMousemove = this.handleMousemove.bind(this);
    this.handleMouseout  = this.handleMouseout.bind(this);
    this.handleMouseup   = this.handleMouseup.bind(this);
    this.handleResize    = this.handleResize.bind(this);
  }

  componentDidMount() {
    // init canvas contexts
    this.brushContext = this.refs.brush.getContext('2d');
    this.layerContext = this.refs.layer.getContext('2d');

    // Attach event listeners
    this.refs.canvas.addEventListener('mousedown', this.handleMousedown);
    this.refs.canvas.addEventListener('mouseup', this.handleMouseup);
    this.refs.canvas.addEventListener('mousemove', this.handleMousemove);
    this.refs.canvas.addEventListener('mouseout', this.handleMouseout);
    window.addEventListener('resize', this.handleResize);

    // Call necessary init methods
    this.handleResize();
  }

  componentDidUpdate() {
    this.draw();
  }

  componentWillUnmount() {
    this.refs.canvas.removeEventListener('mousedown', this.handleMousedown);
    this.refs.canvas.removeEventListener('mouseup', this.handleMouseup);
    this.refs.canvas.removeEventListener('mousemove', this.handleMousemove);
    this.refs.canvas.removeEventListener('mouseout', this.handleMouseout);
    window.removeEventListener('resize', this.handleResize);
  }

  handleMousedown(e) {
    this.setState({ mousedown: true }, () => {
      this.addPixel();
    });
  }

  handleMousemove(e) {
    let x = e.offsetX;
    let y = e.offsetY;

    let brushPosition = {
      x: Math.floor(x / this.state.pixelSize) + 1,
      y: Math.floor(y / this.state.pixelSize) + 1
    };

    this.setState({
      brushPosition
    }, () => {
      if (this.state.mousedown) {
        this.addPixel();
      }
    });
  }

  handleMouseout(e) {
    let brushPosition = {
      x: null,
      y: null
    };

    this.setState({
      brushPosition
    });
  }

  handleMouseup(e) {
    this.setState({ mousedown: false });
  }

  handleResize(e) {
    // Reset inline styling so we can recalculate correctly
    this.refs.canvas.style.width = null;
    this.refs.canvas.style.height = null;

    let canvasNodes = document.querySelectorAll('canvas');

    for (var i = 0; i < canvasNodes.length; i++) {
      let canvasNode = canvasNodes[i];

      canvasNode.style.width = null;
      canvasNode.style.height = null;
    }

    // Setting correct canvas size based on "pixel" height and width
    let realHeight = this.refs.canvas.offsetHeight;
    let realWidth  = this.refs.canvas.offsetWidth;

    let longestPixelAxis = this.state.height > this.state.width ? this.state.height : this.state.width;
    let shortestRealAxis  = realHeight > realWidth ? realWidth : realHeight;

    // Determine pixel size
    // Use the longest axis to determine the pixel size
    let pixelSize = Math.floor(shortestRealAxis / longestPixelAxis);

    let canvasWidth  = pixelSize * this.state.width;
    let canvasHeight = pixelSize * this.state.height;

    this.refs.canvas.style.width  = `${canvasWidth}px`;
    this.refs.canvas.style.height = `${canvasHeight}px`;

    this.refs.brush.width        = canvasWidth;
    this.refs.brush.style.width  = `${canvasWidth}px`;
    this.refs.brush.height       = canvasHeight;
    this.refs.brush.style.height = `${canvasHeight}px`;

    this.refs.layer.width        = canvasWidth;
    this.refs.layer.style.width  = `${canvasWidth}px`;
    this.refs.layer.height       = canvasHeight;
    this.refs.layer.style.height = `${canvasHeight}px`;

    this.setState({
      pixelSize
    });
  }

  addPixel() {
    let pixels = Object.assign([], this.state.pixels);
    let x = this.state.brushPosition.x - 1;
    let y = this.state.brushPosition.y - 1;

    if (typeof pixels[x] === 'undefined') {
      pixels[x] = [];
    }

    pixels[x][y] = {
      r: 0,
      g: 0,
      b: 0,
      a: 1
    };

    this.setState({
      pixels
    });
  }

  draw() {
    this.drawBrush();
    this.drawLayer();
  }

  drawBrush() {
    this.brushContext.clearRect(0, 0, this.refs.canvas.offsetWidth, this.refs.canvas.offsetHeight)
    this.brushContext.fillStyle = 'rgba(0, 0, 0, 0.3)';
    if (this.state.brushPosition.x !== null && this.state.brushPosition.y !== null) {
      let x = (this.state.brushPosition.x - 1) * this.state.pixelSize;
      let y = (this.state.brushPosition.y - 1) * this.state.pixelSize;

      this.brushContext.fillRect(
        x,
        y,
        this.state.pixelSize,
        this.state.pixelSize
      );
    }
  }

  drawLayer() {
    this.layerContext.fillStyle = 'rgba(0, 0, 0, 1)';

    for (var w = 0; w < this.state.width; w++) {
      for (var h = 0; h < this.state.height; h++) {
        if (typeof this.state.pixels[w] !== 'undefined' && typeof this.state.pixels[w][h] !== 'undefined') {
          let x = w * this.state.pixelSize;
          let y = h * this.state.pixelSize;

          this.layerContext.fillRect(
            x,
            y,
            this.state.pixelSize,
            this.state.pixelSize
          );
        }
      }
    }
  }

  render() {
    return (
      <div className="editor">
        <div ref="canvas" className="canvas">
          <canvas ref="brush"></canvas>
          <canvas ref="layer"></canvas>
        </div>
      </div>
    );
  }
}

export default Editor;
