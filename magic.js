var WIDTH = 1280;
var HEIGHT = 720;
var SLICES = 12;
var SLICE_WIDTH = Math.floor(WIDTH / SLICES);

// var MAX_SHIFT = Math.round(0.05 * SLICE_WIDTH);
var MAX_SHIFT = Math.round(0.20 * SLICE_WIDTH);
// var MAX_SHIFT = 30;

window.addEventListener("load", function() {
  console.log('document loaded');
  loadInputData(generateCanvas);
});

function loadInputData(callback) {
  console.log('loadInputData');

  var inputCanvas = document.createElement("canvas");
  inputCanvas.width = WIDTH;
  inputCanvas.height = HEIGHT;

  var img = new Image();
  img.src = "Skull3dRelief.png";
  img.onload = function() {
    var ctx = inputCanvas.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, inputCanvas.width, inputCanvas.height);
    var w,h;
    var aspect = img.width / img.height;
    var canvasAspect = inputCanvas.width / inputCanvas.height;
    if (aspect >= canvasAspect) {
      w = inputCanvas.width;
      h = w / aspect;
    }
    else {
      h = inputCanvas.height;
      w = h * aspect;
    }
    var x = (inputCanvas.width - w) / 2;
    var y = (inputCanvas.height - h) / 2;
    ctx.drawImage(img, x, y, w, h);
    var pixel = ctx.getImageData(0, 0, inputCanvas.width, inputCanvas.height);
    if (callback) {
      callback(pixel);
    }
  }
}

function generateCanvas(input) {
  console.log('generateCanvas');
  var canvas = createCanvas();
  var slice = createNoiseSlice(SLICE_WIDTH, HEIGHT);
  renderSlices(canvas, slice);

  makeMagic(canvas, input);
}

function createCanvas() {
  console.log('createCanvas');
  var c = document.createElement("canvas");
  c.width = WIDTH;
  c.height = HEIGHT;
  document.body.appendChild(c);
  return c;
}

function createNoiseSlice(w, h) {
  console.log('createNoiseSlice');
  var c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  var ctx = c.getContext("2d");
  var pixel = ctx.getImageData(0, 0, w, h);
  var data = pixel.data;
  for (var x=0; x<w; x++) {
    for (var y=0; y<h; y++) {
      var i = coordsToIndex(x, y, w);
      var color = getRandomColor();
      data[i] = color.r;
      data[i+1] = color.g;
      data[i+2] = color.b;
      data[i+3] = color.a;
    }
  }
  return pixel;
}

function renderSlices(canvas, slice) {
  var ctx = canvas.getContext("2d");
  for (var i=0; i < (WIDTH / SLICE_WIDTH); i++) {
    var x = i * SLICE_WIDTH;
    ctx.putImageData(slice, x, 0);
  }
}

function makeMagic(canvas, input) {
  var w = canvas.width;
  var h = canvas.height;
  var ctx = canvas.getContext("2d");
  var output = ctx.getImageData(0, 0, w, h);

  for (var i=0; i < output.data.length; i+=4) {
    var pt = indexToCoords(i, w);
    var x = pt.x;
    var y = pt.y;

    var inp = getPixelAt(input.data, x, y, w);
    var val = inp[0];
    var shift = Math.floor((val / 255) * MAX_SHIFT);
    if (shift) {
      var pixel = getPixelAt(output.data, x + shift, y, w);

      for (var x2=x; x2 < w; x2 += SLICE_WIDTH) {
        var j = coordsToIndex(x2, y, w);
        output.data[j] = pixel[0];
        output.data[j+1] = pixel[1];
        output.data[j+2] = pixel[2];
        // output.data[j+3] = pixel[3];
      }
    }
  }

  ctx.putImageData(output, 0, 0);
}

function getPixelAt(data, x, y, w) {
  if (x >= w || x < 0) {
    return [0, 0, 0, 255];
  }
  var i = coordsToIndex(x, y, w);
  return data.slice(i, i + 4);
}

function indexToCoords(i, w) {
  var stride = w * 4;
  var y = Math.floor(i / stride);
  var x = (i - (y * stride)) / 4;
  return {
    x: x,
    y: y
  }
}

function coordsToIndex(x, y, w) {
  var stride = w * 4;
  return y * stride  +  (x * 4);
}

function getRandomColor() {
  return {
    r: Math.floor(Math.random() * 255),
    g: Math.floor(Math.random() * 255),
    b: Math.floor(Math.random() * 255),
    a: 255
  }
}
