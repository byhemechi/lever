const c = document.querySelector("#editor");
const ctx = c.getContext("2d");
var pix = 8;
var size = 8 * pix;
const dialog = require('electron').remote.dialog;
const fs = require('fs');
var path;
const YAML = require("yamljs");

ctx.imageSmoothingEnabled = false

var writeMode = false;

var types = new Image();

var hovpos = {
  x: 0,
  y: 0
}

var xp = 0;
var yp = 0;

/*
██████  ███████ ███████  █████  ██    ██ ██   ████████ ███████
██   ██ ██      ██      ██   ██ ██    ██ ██      ██    ██
██   ██ █████   █████   ███████ ██    ██ ██      ██    ███████
██   ██ ██      ██      ██   ██ ██    ██ ██      ██         ██
██████  ███████ ██      ██   ██  ██████  ███████ ██    ███████
*/



var settings = {
  editMode: 0,
  pattern: 0,
  width: 5,
  preview: true,
  height: 5,
  name: "level01",
  zoom: 1,
  music: "mus_level01",
  tileset: "level01_tiles.png",
  type: 1,
  "Open Tileset": function() {
    path = dialog.showOpenDialog({
      filters: [{
        name: "PNG Image file",
        extensions: ["png"]
      }]
    })[0]
    fs.readFile(path, function(err, data) {
      var buf = 'data:image/png;base64,' + new Buffer(data).toString('base64')
      settings.tileset = buf
      types.src = settings.tileset
    })
  },
  save() {
    if(path) {
      var isJSON = path.match(/(jlev|json)$/i)
      fs.writeFile(path, (isJSON ? JSON : YAML).stringify({
        name: settings.name,
        width: settings.width,
        height: settings.height,
        tiles: ld,
        patterns: patterns,
        tileset: settings.tileset,
        music: settings.music
      }, true, 2))
    } else this.saveAs()
  },
  saveAs() {
    path = dialog.showSaveDialog({
      filters: [{
        name: "YAML Level",
        extensions: ["lev", "yaml", "yml", "zstlev"]
      }, {
        name: "JSON Level",
        extensions: ["jlev", "json"]
      }]
    })
    var isJSON = path.match(/(jlev|json)$/i)
    fs.writeFile(path, (isJSON ? JSON : YAML).stringify({
      name: settings.name,
      width: settings.width,
      height: settings.height,
      tiles: ld,
      patterns: patterns,
      tileset: settings.tileset,
      music: settings.music
    }, true, 2))
  },
  load() {
    path = dialog.showOpenDialog({
      filters: [{
        name: "Level file",
        extensions: ["lev", "yaml", "yml", "zstlev", "jlev", "json"]
      }]
    })[0]
    fs.readFile(path, 'utf-8', function(err, data) {
      if(!err) {
        var isJSON = path.match(/(jlev|json)$/i)
        data = (isJSON ? JSON : YAML).parse(data);
        settings.width = data.width;
        settings.height = data.height;
        onresize();
        settings.name = data.name;
        settings.music = data.music;
        settings.tileset = data.tileset;
        ld = data.tiles;
        patterns = data.patterns;
        types.src = settings.tileset

        patch.max(patterns.length);
        etch.max(patterns.length - 1);

        for (var i in gui.__controllers) {
          gui.__controllers[i].updateDisplay();
        }
      }
    })
  }
}

types.src = settings.tileset

var ld;

/*
██████  ███████ ███████ ██ ███████ ███████
██   ██ ██      ██      ██    ███  ██
██████  █████   ███████ ██   ███   █████
██   ██ ██           ██ ██  ███    ██
██   ██ ███████ ███████ ██ ███████ ███████
*/



function onresize() {
  var old = ld
  ld = new Array(settings.height);
  for(var i = 0; i < ld.length; ++i) {
    var ta = new Array(settings.width)
    for(var j = 0; j < ta.length; ++j) {
      ta[j] = old && old[i] && old[i][j] && old[i][j] != undefined ? old[i][j] : 0
    }
    ld[i] = ta
  }
}

var patterns = [
  [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0]
  ]
]

/*
██████   █████  ████████  ██████  ██    ██ ██
██   ██ ██   ██    ██    ██       ██    ██ ██
██   ██ ███████    ██    ██   ███ ██    ██ ██
██   ██ ██   ██    ██    ██    ██ ██    ██ ██
██████  ██   ██    ██ ██  ██████   ██████  ██
*/



var gui = new dat.gui.GUI();
var patfo = gui.addFolder("Pattern Editor");
var edfo = gui.addFolder("Level Editor");
var gafo = gui.addFolder("Level Settings");

gui.add(settings, "editMode", {
  "Level Editor": 0,
  "Pattern Editor": 1
});
// var ts = gafo.add(settings, "tileset");
gafo.add(settings, "name");
gafo.add(settings, "music");
gui.add(settings, "save")
gui.add(settings, "saveAs")
gui.add(settings, "load")
gui.add(settings, "Open Tileset")
gui.add(settings, "zoom").min(0.05).max(4).step(0.05)
var etch = edfo.add(settings, "pattern").min(0).max(patterns.length - 1).step(1);
edfo.add(settings, "preview");
var lw = gafo.add(settings, "width").min(0).step(1);
var lh = gafo.add(settings, "height").min(0).step(1);
var patch = patfo.add(settings, "pattern").min(0).max(patterns.length).min(0).max(patterns.length).step(1)
var typel = patfo.add(settings, "editMode")
types.onload = function() {
  patfo.remove(typel)
  typel = patfo.add(settings, "type").min(0).max(types.width / 8).step(1)
}

gafo.open()

function setPattern(x, y, n = 0) {
  if(settings.editMode == 0) {
    ld[y][x] = settings.pattern
  } else {
    patterns[settings.pattern][y][x] = settings.type
  }
}

c.addEventListener("mousedown", function(e) {
  writeMode = true;
  if(writeMode) {
    setPattern(Math.floor((e.clientX + document.body.scrollLeft) / size), Math.floor((e.clientY + document.body.scrollTop) / size));
  }
})
c.addEventListener("mouseup", function(e) {
  writeMode = false;
})
c.addEventListener("mouseout", function() {
  nohov = true
})

var nohov = true;

c.addEventListener("mousemove", function(e) {
  nohov = false
  if(writeMode) {
    setPattern(Math.floor((e.clientX + document.body.scrollLeft) / size), Math.floor((e.clientY + document.body.scrollTop) / size));
  }
  hovpos = {
    x: Math.floor((e.clientX + document.body.scrollLeft) / size),
    y: Math.floor((e.clientY + document.body.scrollTop) / size)
  }
  xp = e.clientX + document.body.scrollLeft
  yp = e.clientY + document.body.scrollTop
})

const drawPattern = function pattern(n = 0, x = 0, y = 0) {
  if(!patterns[n]) {
    patterns[n] = [
      [0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0]
    ]
  }
  const pat = patterns[n];
  for(var i = 0; i < pat.length; ++i) {
    for(var j = 0; j < pat[i].length; ++j) {
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(types, pat[i][j] * 8, 0, 8, 8, x + (j * pix), y + (i * pix), pix, pix)
    }
  }
}

/*
██████  ███████ ███    ██ ██████  ███████ ██████
██   ██ ██      ████   ██ ██   ██ ██      ██   ██
██████  █████   ██ ██  ██ ██   ██ █████   ██████
██   ██ ██      ██  ██ ██ ██   ██ ██      ██   ██
██   ██ ███████ ██   ████ ██████  ███████ ██   ██
*/

const render = function draw(t) {
  pix = settings.zoom * 8;
  size = pix * 8;
  gui.__folders["Level Editor"].domElement.style.display = 'none'
  gui.__folders["Pattern Editor"].domElement.style.display = 'none'
  patch.updateDisplay()
  etch.updateDisplay()
  edfo.close();
  patfo.close();
  if(settings.editMode == 0) {
    gui.__folders["Level Editor"].domElement.style.display = 'list-item'
    c.width = settings.width * size;
    c.height = settings.height * size;
    edfo.open();
    for(var i = 0; i < ld.length; ++i) {
      for(var j = 0; j < ld[i].length; ++j) {``
        drawPattern(ld[i][j], j * size, i * size);
      }
    }

    if(ld[hovpos.y] && ld[hovpos.y][hovpos.x]) {
      if(settings.preview) {
        ctx.globalAlpha = 0.5;
        drawPattern(settings.pattern, hovpos.x * size, hovpos.y * size)
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, 0.5)`
        ctx.fillRect(hovpos.x * size, hovpos.y * size, size, size);
      }
    }
  } else {
    gui.__folders["Pattern Editor"].domElement.style.display = 'list-item'
    patfo.open();
    if(!patterns[settings.pattern]) {
      patterns.push([
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0]
      ]);
      settings.pattern = patterns.length - 1
    }
    c.width = 8 * size;
    c.height = 8 * size;
    var pat = patterns[settings.pattern];
    for(var i in pat) {
      for(var j in pat[i]) {
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(types, pat[i][j] * 8, 0, 8, 8, j * size, i * size, size, size)
      }
    }
  }
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(0,0,0,0.5)"
  if(!nohov) ctx.strokeRect(hovpos.x * size, hovpos.y * size, size, size);
  ctx.stroke();
  requestAnimationFrame(render);
}
/*
███████ ██    ██ ███████ ███    ██ ████████ ███████
██      ██    ██ ██      ████   ██    ██    ██
█████   ██    ██ █████   ██ ██  ██    ██    ███████
██       ██  ██  ██      ██  ██ ██    ██         ██
███████   ████   ███████ ██   ████    ██    ███████
*/


lw.onChange(onresize);
lh.onChange(onresize);
// ts.onFinishChange(function(){
//   types.src = settings.tileset
// })
patch.onFinishChange(function(){
  patch.max(patterns.length);
  etch.max(patterns.length - 1);
})
etch.onFinishChange(function(){
  patch.max(patterns.length);
  etch.max(patterns.length - 1);
})

onresize();

requestAnimationFrame(render);
