grid = {

  cdt: 0,
  scaleX: 1,
  scaleY: 1,
  pi: Math.PI,
  //displayField:0,
  //colorMap:0,
  Ez: '',
  Hx: '',
  Hy: '',
  dx: '',
  dy: '',
  cx: '',
  cy: '',
  dtc: '',
  console: '',
  container: null,
  init: function(options) {
    this.settings = $.extend({
      canvasWidth: 600,
      canvasHeight: 400,
      Nx: 100,
      Ny: 100,
      xmin: 0,
      xmax: 6,
      ymin: 0,
      ymax: 4,
      dt: '',
      counter: 0,
      c0: 1,
      pmlWidth: 10,
      mu: 1,
      eps: 1,
      sigma: 0.2,
      sigmah: 0,
      stopTime: Infinity,
      display: {
        mode: 'TE',
        field: 'Ez',
        grid: false,
        time: true,
        axes: true,
        pml: false,
        matrix: false,
        refreshrate: 1
      },
      color: {
        model: 1,
        hue: 0.42,
        saturation: 0.26,
        intensity: 1.48,
        gamma: 1.86
      }
    }, options);
    this.Nx = this.settings.Nx;
    this.Ny = this.settings.Ny;
    this.xmin = this.settings.xmin;
    this.xmax = this.settings.xmax;
    this.ymin = this.settings.ymin;
    this.ymax = this.settings.ymax;
    this.dt = this.settings.dt;
    this.c0 = this.settings.c0;
    this.pmlWidth = this.settings.pmlWidth;

    this.scaleX = this.settings.canvasWidth / this.Nx;
    this.scaleY = this.settings.canvasHeight / this.Ny;
    this.Ez = this.createArray(this.Nx, this.Ny);
    this.Hx = this.createArray(this.Nx, this.Ny);
    this.Hy = this.createArray(this.Nx, this.Ny);
    this.eps = this.createArray(this.Nx, this.Ny);
    this.sigmaE = this.createArray(this.Nx, this.Ny);
    this.sigmaH = this.createArray(this.Nx, this.Ny);
    this.mu = this.createArray(this.Nx, this.Ny);
    ////box=600/Nx;     
    this.loadArrays();
    if (this.Nx > 40) this.xSampleRate = 1 + this.Nx / 50; //1 is added to avoid zero
    if (this.Ny > 40) this.ySampleRate = 1 + this.Ny / 50;
  },

  loadArrays: function() {
    this.findStepSize();
    this.clearFields();
    this.seteps(0, 0, this.Nx, this.Ny, this.settings.eps);
    this.setmu(0, 0, this.Nx, this.Ny, this.settings.mu);
    this.setSigmaE(0, 0, this.Nx, this.Ny, this.settings.sigma);
    this.setSigmaH(0, 0, this.Nx, this.Ny, this.settings.sigmah);
    this.putPML();
  },
  empty: function() {
    if (this.container) this.container.find('.subcontainer').empty();
  },
  remove: function(type) {
    if (this.container) this.container.removeComponents(type);
  },
  createArray: function(n, m) {
    var arr = [n];
    for (var i = 0; i < n; i++) {
      arr[i] = [m];
    }
    return arr;
  },

  findStepSize: function() { ///this finds both time and space step size
    this.dx = (this.xmax - this.xmin) / this.Nx;
    this.dy = (this.ymax - this.ymin) / this.Ny;
    this.cx = 1 / this.dx;
    this.cy = 1 / this.dy;
    this.dtc = 1 / (1.1 * this.c0 * (Math.sqrt(this.cx * this.cx + this.cy * this.cy)));
    this.dt = this.dtc;
  },

  clearFields: function() {
    for (var i = 0; i < this.Nx; i++)
      for (var j = 0; j < this.Ny; j++) {
        this.Ez[i][j] = 0;
        this.Hx[i][j] = 0;
        this.Hy[i][j] = 0;
      }
  },
  seteps: function(x1, y1, x2, y2, value) {
    if (x1 < 0) x1 = 0;
    if (x2 > this.Nx - 1) x2 = this.Nx - 1;
    if (y1 < 0) y1 = 0;
    if (y2 > this.Ny - 1) y2 = this.Ny - 1;

    for (var i = x1; i <= x2; i++)
      for (var j = y1; j <= y2; j++)
        this.eps[i][j] = value;
  },

  clearSlabs: function() {
    this.seteps(0, 0, this.Nx, this.Ny, this.settings.eps);
    this.setmu(0, 0, this.Nx, this.Ny, this.settings.mu);
    this.setSigmaE(0, 0, this.Nx, this.Ny, this.settings.sigma);
    this.setSigmaH(0, 0, this.Nx, this.Ny, this.settings.sigmah);
  },
  setmu: function(x1, y1, x2, y2, value) {
    if (x1 < 0) x1 = 0;
    if (x2 > this.Nx - 1) x2 = this.Nx - 1;
    if (y1 < 0) y1 = 0;
    if (y2 > this.Ny - 1) y2 = this.Ny - 1;

    for (var i = x1; i <= x2; i++)
      for (var j = y1; j <= y2; j++)
        this.mu[i][j] = value;
  },

  setSigmaE: function(x1, y1, x2, y2, sigma) {
    if (x1 < 0) x1 = 0;
    if (x2 > this.Nx - 1) x2 = this.Nx - 1;
    if (y1 < 0) y1 = 0;
    if (y2 > this.Ny - 1) y2 = this.Ny - 1;

    for (var i = x1; i <= x2; i++)
      for (var j = y1; j <= y2; j++)
        this.sigmaE[i][j] = sigma;
    this.putPML(); //again re defining the PML to mathch the boundaries

  },


  setSigmaH: function(x1, y1, x2, y2, sigmah) {
    if (x1 < 0) x1 = 0;
    if (x2 > this.Nx - 1) x2 = this.Nx - 1;
    if (y1 < 0) y1 = 0;
    if (y2 > this.Ny - 1) y2 = this.Ny - 1;

    for (var i = x1; i <= x2; i++)
      for (var j = y1; j <= y2; j++)
        this.sigmaH[i][j] = sigmah;
  },

  putPML: function() {
    var cx = this.Nx / 2,
      cy = this.Ny / 2,
      dx = this.Nx / 2 - this.pmlWidth,
      dy = this.Ny / 2 - this.pmlWidth;
    for (var i = 0; i < this.Nx; i++) {
      for (var j = 0; j < this.Ny; j++) {
        var x = Math.abs(i - cx);
        var y = Math.abs(j - cy);
        if (x > dx) {
          this.sigmaE[i][j] = this.settings.sigma + (x - dx);
          this.sigmaH[i][j] = this.settings.sigma + (x - dx);

        }
        if (y > dy) {
          this.sigmaE[i][j] = this.settings.sigma + (y - dy);
          this.sigmaH[i][j] = this.settings.sigma + (y - dy);
        }
      }
    }
  },



  updateFields: function() {
    try {

      for (var i = 0; i < this.Nx - 1; i++)
        for (var j = 1; j < this.Ny - 1; j++) {
          this.Hx[i][j] -= this.dt * (this.Ez[i][j] - this.Ez[i][j - 1]) / (this.dy * this.mu[i][j]);
          this.Hx[i][j] -= this.sigmaH[i][j] * this.dt * this.Hx[i][j];
        }

      for (var j = 0; j < this.Ny - 1; j++)
        for (var i = 1; i < this.Nx - 1; i++) {
          this.Hy[i][j] += this.dt * (this.Ez[i][j] - this.Ez[i - 1][j]) / (this.dx * this.mu[i][j]);
          this.Hy[i][j] -= this.sigmaH[i][j] * this.dt * this.Hy[i][j];
        }

      for (var i = 0; i < this.Nx - 1; i++)
        for (var j = 0; j < this.Ny - 1; j++) {
          this.Ez[i][j] += (this.Hy[i + 1][j] - this.Hy[i][j]) * this.dt / (this.dx * this.eps[i][j]) - (this.Hx[i][j + 1] - this.Hx[i][j]) * this.dt / (this.dy * this.eps[i][j]);
          this.Ez[i][j] -= (this.sigmaE[i][j] * this.dt / this.eps[i][j]) * this.Ez[i][j];
        }

    } catch (e) {}

  }, ///update fields

  drawField: function() {

    if (grid.settings.display.matrix) {
      this.drawMatrix();
    } else {
      for (var i = 0; i < this.Nx; i++) {
        for (var j = 0; j < this.Ny; j++) {
          this.setColorMap(i, j);
          ctx.fillRect(i * this.scaleX, j * this.scaleY, this.scaleX, this.scaleY);
        }
      }

    }

    if (grid.settings.display.grid) this.showGrid();
    if (grid.settings.display.time) this.showTime();
    if (grid.settings.display.axes) this.showAxes();


  },
  drawMonitorPlot: function() {
    //	console.log('monitory field');	


    container.find('#monitor').children().each(function() {


      var s = $(this).get(0).settings;
      var h = $(this).height();


      //x-axis
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.moveTo(s.x1 * grid.scaleX, (s.y) * grid.scaleY);
      ctx.lineTo(s.x2 * grid.scaleX, (s.y) * grid.scaleY);
      ctx.closePath();
      ctx.stroke();

      ctx.strokeStyle = s.display.strokeColor;
      ctx.fillStyle = s.display.fillColor;

      ctx.beginPath();

      if (s.display.fill) {
        ctx.moveTo(s.x1 * grid.scaleX, (s.y) * grid.scaleY);
      }

      for (var x = s.x1; x < s.x2; x++) {
        var E;
        if (s.display.field == 'Ez') {
          E = grid.Ez[x][s.y];
        } else if (s.display.field == 'Hx') {
          E = grid.Hx[x][s.y];
        } else if (s.display.field == 'Hy') {
          E = grid.Hy[x][s.y];
        }

        if (s.display.type == 'Intensity') {
          E = -E * E * 2 * grid.getNonLinearScale(h);
        } else if (s.display.type == 'Amplitude') {
          E *= grid.getNonLinearScale(h);
        } else if (s.display.type == 'Eps') {
          E = -grid.eps[x][s.y] * grid.getNonLinearScale(h) / 50;
        }


        ctx.lineTo(x * grid.scaleX, (s.y + E) * grid.scaleY);
      }

      if (s.display.fill) {
        ctx.lineTo(s.x2 * grid.scaleX, (s.y) * grid.scaleY);
        ctx.fill();
      }
      ctx.lineWidth = s.display.strokeSize;
      ctx.stroke();

    });
  },
  //below f(x) drastically increases for x>85 and f(x) < 1 for x<85
  //can be used as no linear amplitude tuning
  getNonLinearScale: function(x) {
    return x * x * x / ((100 - x) * (100 - x) * 50);
  },
  drawMatrix: function() {
    var boxWidth = 1 + this.Nx / 50;
    var boxHeight = 1 + this.Ny / 50;
    for (var i = 0; i < this.Nx; i++) {
      for (var j = 0; j < this.Ny; j++) {
        if (i % boxWidth == 0 & j % boxHeight == 0) {
          ctx.fillStyle = 'black';
          ctx.fillRect(i * this.scaleX, j * this.scaleY, this.scaleX * boxWidth, this.scaleY * boxWidth);
          this.setColorMap(i, j);
          ctx.fillText(parseInt(this.Ez[i][j] * 100), i * this.scaleX, j * this.scaleY);
        }
      }
    }

  },
  showTime: function() {
    ctx.fillStyle = 'white';
    ctx.fillText(this.c0 * grid.settings.counter * this.dt, 22, 16);
  },
  showAxes: function() {
    ctx.strokeStyle = 'yellow';
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.moveTo(25, 25);
    ctx.lineTo(100, 25);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(25, 25);
    ctx.lineTo(25, 100);
    ctx.closePath();
    ctx.stroke();
    ctx.fillText('X', 105, 30);
    ctx.fillText('Y', 22, 115);

  },
  showGrid: function() {
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    for (var i = 0; i < canvas.width; i += 100) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.closePath();
      ctx.stroke();
    }
    for (var i = 0; i < canvas.height; i += 100) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.closePath();
      ctx.stroke();
    }
  },
  setColorMap: function(i, j) {

    var E;
    if (grid.settings.display.field == 'Hx') {
      E = this.Hx[i][j];
    } else if (grid.settings.display.field == 'Hy') {
      E = this.Hy[i][j];
    } else {
      E = this.Ez[i][j];
    }


    E -= Math.log(this.eps[i][j]) / 10; //to show slab 

    //color gamma adjustment
    E *= grid.settings.color.gamma;

    if (E > 1) E = 1;
    else if (E < -1) E = -1;
    var k = Math.abs((E + 1) / 2);





    //get color model
    if (grid.settings.color.model == 1) {
      var rgb = this.getWaveColorModel(k);
    } else if (grid.settings.color.model == 2) {
      var rgb = this.getSandColorModel(k);
    } else if (grid.settings.color.model == 3) {
      var rgb = this.getPlaneColorModel(E);
    } else if (grid.settings.color.model == 4) {
      var rgb = this.getTwoColorModel(E);
    }


    //color adjustments
    var hsv = this.rgbTohsvVector(rgb);
    //hue adjustment
    hsv[0] = (hsv[0] + grid.settings.color.hue) % 1;
    hsv[1] = (hsv[1] + grid.settings.color.saturation) % 1;
    hsv[2] = hsv[2] * grid.settings.color.intensity;

    var rgb = this.hsvTorgbVector(hsv);
    this.setFillStyle(rgb);

  },

  getWaveColorModel: function(k) {
    var rr = this.hsvToRgb(k, 1, 1);
    var gg = this.hsvToRgb(1, k, 1);
    var bb = this.hsvToRgb(1, 1, k);
    return [rr[0], gg[1], bb[2]];
  },
  getSandColorModel: function(k) {
    return this.hsvToRgb(k, 1, k);
  },
  getPlaneColorModel: function(E) {
    if (E > 0) {
      return [E * 255, 0, 0];
    } else {
      return [0, 0, E * -255];
    }

  },
  getTwoColorModel: function(E) {
    if (E > 0) {
      return [255, 0, 0];
    } else {
      return [0, 0, 255];
    }
  },
  setFillStyle: function(vector) {
    var fillcolor = 'rgb(' + vector[0] + ',' + vector[1] + ',' + vector[2] + ')';
    ctx.fillStyle = fillcolor;
  },

  hsvTorgbVector: function(v) {
    return this.hsvToRgb(v[0], v[1], v[2]);
  },
  rgbTohsvVector: function(v) {
    return this.rgbToHsv(v[0], v[1], v[2]);
  },
  /**
   * Converts an HSV color value to RGB. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
   * Assumes h, s, and v are contained in the set [0, 1] and
   * returns r, g, and b in the set [0, 255].
   *
   * @param   Number  h       The hue
   * @param   Number  s       The saturation
   * @param   Number  v       The value
   * @return  Array           The RGB representation
   */
  hsvToRgb: function(h, s, v) {
    var r, g, b;
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0:
        r = v, g = t, b = p;
        break;
      case 1:
        r = q, g = v, b = p;
        break;
      case 2:
        r = p, g = v, b = t;
        break;
      case 3:
        r = p, g = q, b = v;
        break;
      case 4:
        r = t, g = p, b = v;
        break;
      case 5:
        r = v, g = p, b = q;
        break;
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  },

  /**
   * Converts an RGB color value to HSV. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
   * Assumes r, g, and b are contained in the set [0, 255] and
   * returns h, s, and v in the set [0, 255].
   *
   * @param   Number  r       The red color value
   * @param   Number  g       The green color value
   * @param   Number  b       The blue color value
   * @return  Array           The HSV representation
   */
  rgbToHsv: function(r, g, b) {
    r = r / 255, g = g / 255, b = b / 255;
    var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h, s, v];
  },
  simId: null,
  paussSim: false,
  startSimulation: function() {  
  	var that = this;
	if(!this.simulation.running){
		if(!this.simulation.interval || this.simulation.interval == 0){  	
	  		console.log('starting animloop ');	
	  		this.simulation.running = true;		
	  		animloop();  		
	  		this.simType='animloop';   
	  		
	  	}else{
	  		console.log('starting time loop with interval:'+this.simulation.interval);	
	  		this.simulation.running = true;		
	  		this.simType='timeloop';
	  		timeloop();  		 	  		
	  	}
	
	}
  	  	
  	function animloop(){
  		that.simId = requestAnimFrame(animloop)
  		render();
  	}
  	function timeloop(){
		    	that.simId=window.setTimeout(function(){    			
    				render();timeloop();
    			},that.simulation.interval);
    	}
  	
  	
    	
	function render(){		
		  grid.settings.counter++;
		  if (grid.container) {
		    grid.container.updateComponents();
		  }
		  grid.updateFields();

		  if (grid.settings.counter % grid.settings.display.refreshrate == 0)
		    grid.drawField();
		  if (grid.container) {
		    grid.drawMonitorPlot();
		  }		
	}
  },

  stopSimulation: function() {
  	console.log('stopping: '+grid.simType);
  	if(grid.simType=='animloop'){
  		cancelAnimationFrame(this.simId);    
  		grid.simulation.running=false;
  	}else{
  		clearTimeout(this.simId);	
  		grid.simulation.running=false;
  	}
    
  },

  simulation: {
    running:false,
    interval:0,
    start: function(interval) {
    	this.interval = interval;
      grid.startSimulation();
    },
    stop: function() {
      grid.stopSimulation();
      grid.clearFields();
      grid.drawField();
    },
    pause: function() {
      grid.stopSimulation();
    },
    play: function() {
      grid.startSimulation();
    },
    refresh: function() {
      grid.settings.counter = 0;
      grid.clearFields();
      grid.drawField();
    }
  },

  //returns rand between a and b
  getRand: function(a, b) {
    return Math.round(a + (b - a) * Math.random());
  },

  //pixels to wavelength units
  canvasX2spaceX: function(x) {
    return x * this.dx / this.scaleX;
  },

  //pixels to wavelength units
  canvasY2spaceY: function(y) {
    return y * this.dy / this.scaleY;
  },

  //wavelength units to pixels
  spaceX2canvasX: function(x) {
    return x * this.scaleX / this.dx;
  },

  //wavelength units to pixels
  spaceY2canvasY: function(y) {
    return y * this.scaleY / this.dy;
  },

  canvasX2gridX: function(x) {
    return parseInt(x / this.scaleX);

  },

  canvasY2gridY: function(y) {
    return parseInt(y / this.scaleY);
  },

  spaceX2gridX: function(x) {
    return parseInt(x / this.dx);
  },

  spaceY2gridY: function(y) {
    return parseInt(y / this.dy);
  },



  isInsideGrid: function(x, y) {
    if (0 <= x & x < this.Nx & 0 <= y & y < this.Ny)
      return true;
    else
      return false;
  }







  ///end of grid object//////////////////////////////////////
};


activeSlab = null;
container = null;
(function($) {
  var componentId = 0;

  $.fn.createContainer = function(options) {
    var settings = $.extend({
      //default options/settings			
    }, options);
    this.get(0).settings = settings;
    this.append('<div id="slab" class="subcontainer"></div>').append('<div id="monitor" class="subcontainer"></div>').append('<div id="source" class="subcontainer"></div>');
    container = this;

    return this;
  };

  $.fn.createComponent = function(options) {
    var settings = $.extend({
      type: 'source'
    }, options);
    return this.find('#' + settings.type).appendComponent(settings).addAttribs(settings).addEvents(settings);
  };


  //appends a new slab and returns the slab
  $.fn.appendComponent = function(options) {
    componentId++;
    var compId = "comp_" + componentId;
    this.append('<div class= " ' + options.type + ' draggable" id="' + compId + '"  type="' + options.type + '"></div>');
    return this.find('#' + compId);
  }

  //add component specific attributes
  $.fn.addAttribs = function(options) {
    var settings;
    if (options.type == 'source') {
      settings = $.extend({
        cx: 1,
        cy: 1,
        width: 0.2,
        height: 0.2,
        wavelength: 0.5,
        profile: 'point', //types [point, gauss, line]
        gauss: {
          width: 0.2,
          bidirectional: false
        },
        line: {
          width: 2,
          bidirectional: false
        },
        mode: 'cw', //modes [cw,pulse]
        pulse: {
          offTime: 2,
          onTime: 0.5,
          repeated: true
        },
        panel: 'space', //to indicate the all inputs are in space coordinates	
        oncomplete: null
      }, options);

      this.get(0).settings = settings;
      this.updateShape();
      this.setPositions();
    } else if (options.type == 'slab') {
      settings = $.extend({
        cx: 1,
        cy: 1,
        width: 2,
        height: 1,
        eps: 3,
        mu: 1,
        sigma: 0.2,
        sigmah: 0,
        profile: 'rectangle', //profile:rectangle circle and trianlge		
        panel: 'space', //to indicate the all inputs are in space coordinates
        oncomplete: null
      }, options);

      this.get(0).settings = settings;
      this.updateShape();
      this.setPositions();
      this.updateSlab();
    } else if (options.type == 'monitor') {
      settings = $.extend({
        cx: 1.6,
        cy: 4.1,
        width: 2.0,
        height: 1.0,
        display: {
          field: 'Ez',
          type: 'Intensity',
          stroke: true,
          strokeSize: 2,
          strokeColor: '#FFFEBD',
          fill: false,
          fillColor: '#73002A'
        },
        panel: 'space', //to indicate the all inputs are in space coordinates
        oncomplete: null
      }, options);

      this.get(0).settings = settings;
      this.updateShape();
      this.setPositions();
    }

    return this;
  }


  //attached events
  $.fn.addEvents = function(options) {
    this.draggable({
      revert:true,
      stop: function() {
        $(this).updateSettings();
        updatePanel($(this));
      }
    }).dblclick(function() {

    }).click(function() {
      updatePanel($(this)); //see sourceprops.js 			
      $(this).addClass('active');
    }).mousedown(function() {
      $(this).addClass('active');
    });

    if (options.type == 'slab')
      this.resizable({
        minWidth: 18,
        minHeight: 18,
        stop: function() {
          $(this).updateSettings(); // updatePanel($(this));			
        }
      });

    if (options.type == 'monitor')
      this.resizable({
        minWidth: 16,
        minHeight: 16,
        maxHeight: 99,
        stop: function() {
          $(this).updateSettings(); // updatePanel($(this));			
        }
      });

    return this;
  }


  $.fn.updateShape = function() {
    var settings = this.get(0).settings;
    //console.log('updagte shape'+settings.type)
    //console.log(settings);
    if (settings.type == 'source') {
      if (settings.profile == 'point') {
        settings.width = "0.2";
        //this.css('border-radius', '20').css('box-shadow', 'inset 0px 0px 10px');
      } else if (settings.profile == 'gauss') {
        settings.width = settings.gauss.width * 2;
      //  this.css('border-radius', '10');
        //settings.gauss.bidirectional ? this.css('box-shadow', 'inset 0px 0px 10px') : this.css('box-shadow', 'inset 0px -10px 5px');

      } else if (settings.profile == 'line') {
        settings.width = settings.line.width;
       // this.css('border-radius', '5');
        //settings.line.bidirectional ? this.css('box-shadow', 'inset 0px 0px 10px') : this.css('box-shadow', 'inset 0px -10px 5px');
      }
    } else if (settings.type == 'slab') {
      if (settings.profile == 'circle') {

        this.css('border-radius', this.width());
      }
    }

  }


  //
  $.fn.updateSettings = function() {

    var settings = $(this).get(0).settings;

    if (settings.type == 'source') { //for souce body centered coordinates using {x,y,width,height}
      var rect = $(this).getLocation('space-center');
      settings.cx = rect.x;
      settings.cy = rect.y;
      settings.width = rect.width;
      settings.height = rect.height;
    } else if (settings.type == 'slab') { //top left bottom right {x1,y1,x2,y2}
      var rect = $(this).getLocation('space');
      settings.cx = rect.x1;
      settings.cy = rect.y1;
      settings.width = rect.x2 - rect.x1;
      settings.height = rect.y2 - rect.y1;
    } else if (settings.type == 'monitor') {
      var rect = $(this).getLocation('space');
      settings.cx = rect.x1;
      settings.cy = rect.y1;
      settings.width = rect.x2 - rect.x1;
      settings.height = rect.y2 - rect.y1;

      //props required for plot
      var p = $(this).getLocation('grid');

      if (p.x1 < 0) p.x1 = 0;
      if (p.x1 > grid.Nx - 1) p.x1 = grid.Nx - 1;
      if (p.x2 < 0) p.x2 = 0;
      if (p.x2 > grid.Nx - 1) p.x2 = grid.Nx - 1;
      if (p.y1 < 0) p.y1 = 0;
      if (p.y1 > grid.Ny - 1) p.y1 = grid.Ny - 1;
      if (p.y2 < 0) p.y2 = 0;
      if (p.y2 > grid.Ny - 1) p.y2 = grid.Ny - 1;
      var y = parseInt(p.y1 + (p.y2 - p.y1) / 2);

      settings.x1 = p.x1;
      settings.x2 = p.x2;
      settings.y1 = p.y1;
      settings.y2 = p.y2;
      settings.y = y;

    }

    //console.log(settings)		
    if (settings.type == 'slab')
      $(this).updateSlabs();
  }
  //sets the slabLocatlabPositionsion relative canvas	
  $.fn.setCanvasLocation = function(x, y) {
    return this.offset({
      left: $(canvas).offset().left + x,
      top: $(canvas).offset().top + y
    });
  }

  //set the location and dimentions panel=canvas,grid,space	settings={panel:x:,y:,width,height}
  $.fn.setPositions = function() {
    var settings = this.get(0).settings
    if (settings.panel == 'space') {
      //console.log(settings);
      var x = grid.spaceX2canvasX(settings.cx);
      var y = grid.spaceY2canvasY(settings.cy);
      var width = grid.spaceX2canvasX(settings.width);
      var height = grid.spaceY2canvasY(settings.height);

      if (settings.type == 'source') {
        this.setCanvasLocation(x - width / 2, y - height / 2).width(width).height(height);
      } else {
        //console.log('setting location on canvas')
        this.setCanvasLocation(x, y).width(width).height(height);
      }
    } else if (settings.panel == 'grid') {

    }
  }

  //get the location of the slab relative panel in pixels, grid, space units
  //to avoid math rounding errors follow f(x2) = f(x1+width) instead of f(x2)=f(x1)+f(width) where f:canvas2Grid or space
  $.fn.getLocation = function(panel) {
    if (panel == 'canvas') { //returns only {x,y} as this has width and height
      return {
        x: this.offset().left - $(canvas).offset().left,
        y: this.offset().top - $(canvas).offset().top,
        width: this.width(),
        height: this.height()
      };
    } else if (panel == 'grid') { //returns {x1,y1,x1+width,y1+height}
      var p = this.getLocation('canvas');
      return {
        x1: grid.canvasX2gridX(p.x),
        y1: grid.canvasY2gridY(p.y),
        x2: grid.canvasX2gridX(p.x + this.width()),
        y2: grid.canvasY2gridY(p.y + this.height())
      };
    } else if (panel == 'space') { //returns {x1,y1,x1+width,y1+height} top left and bottom right
      var p = this.getLocation('canvas');
      return {
        x1: grid.canvasX2spaceX(p.x),
        y1: grid.canvasY2spaceY(p.y),
        x2: grid.canvasX2spaceX(p.x + this.width()),
        y2: grid.canvasY2spaceY(p.y + this.height())
      };
    } else if (panel == 'space-center') { //return the location in space and body centered coordinates{x,y, width, height}
      var p = this.getLocation('canvas');
      return {
        x: grid.canvasX2spaceX(p.x + p.width / 2),
        y: grid.canvasY2spaceY(p.y + p.height / 2),
        width: grid.canvasX2spaceX(p.width),
        height: grid.canvasY2spaceY(p.height)
      };
    }
  }



  //update source and monitors here 
  //slabs need not be updated for each time step
  $.fn.updateComponents = function() {
    this.updateSources();

  }

  $.fn.getOmega = function() {
    return 2 * Math.PI * grid.c0 / parseFloat(this.get(0).settings.wavelength);
  }


  $.fn.updateSlabs = function() {
    //console.log('updating slabs');
    grid.clearSlabs();
    container.find('#slab').children().each(function() {
      if ($(this).attr('type') == 'slab')
        $(this).updateSlab();
    });
  }

  $.fn.updateSlab = function() {
    var settings = $(this).get(0).settings;
    if (settings) {
      var rect = this.getLocation('grid');
      grid.seteps(rect.x1, rect.y1, rect.x2, rect.y2, settings.eps);
      grid.setmu(rect.x1, rect.y1, rect.x2, rect.y2, settings.mu)
      grid.setSigmaE(rect.x1, rect.y1, rect.x2, rect.y2, settings.sigma);
      grid.setSigmaH(rect.x1, rect.y1, rect.x2, rect.y2, settings.sigmah);
    } //settings		
  } //putSlab

  //updates all sources
  $.fn.updateSources = function() {
    this.find('#source').children().each(function() {
      if ($(this).attr('type') == 'source')
        $(this).putSourceOnGrid(grid.settings.counter);
    });
  }

  $.fn.putSourceOnGrid = function(n) {

    var settings = $(this).get(0).settings;

    if (settings) {
      //var cx = canvasX2gridX(settings.cx);
      //var cy = canvasY2gridY(settings.cy);	

      var t1, t2, T, cdt;
      if (settings.mode == 'pulse') {
        cdt = grid.c0 * grid.settings.counter * grid.dt;
        t1 = parseFloat(settings.pulse.offTime);
        t2 = parseFloat(settings.pulse.onTime);
        T = t1 + t2;
        if (settings.pulse.repeated) cdt %= T;
      }

      var omega = parseFloat($(this).getOmega());
      if (settings.profile == 'point') {

        var x = grid.spaceX2gridX(settings.cx);
        var y = grid.spaceY2gridY(settings.cy);
        if (grid.isInsideGrid(x, y)) {
          //console.log('inside'+grid.settings.counter);
          if (!(settings.mode == 'pulse' && (cdt < t1 || cdt > T)))
            grid.Ez[x][y] = Math.sin(omega * grid.settings.counter * grid.dt);

        }
      } else if (settings.profile == 'gauss') {
        var sx = settings.cx;
        var y = grid.spaceY2gridY(settings.cy);
        var width = settings.gauss.width;
        for (var i = 0; i < grid.Nx; i++) {
          var x = i * grid.dx;
          var amp = (Math.exp(-1 * (sx - x) * (sx - x) / (width * width)));
          var field = amp * Math.sin(omega * grid.settings.counter * grid.dt);
          if (grid.isInsideGrid(i, y))
            if (!(settings.mode == 'pulse' && (cdt < t1 || cdt > T)))
              grid.Ez[i][y] = grid.Ez[i][y] + field;

          if (!settings.gauss.bidirectional & amp > 0.25) //wall remaints for the amp >0.25 % of the maxmimum 
            if (!(settings.mode == 'pulse' && (cdt < t1 || cdt > T)))
              if (grid.isInsideGrid(i, y + 1)) grid.Ez[i][y + 1] = 0;
        }
      } else if (settings.profile == 'line') {
        var x = grid.spaceX2gridX(settings.cx);
        var y = grid.spaceY2gridY(settings.cy);
        var width = grid.spaceX2gridX(settings.line.width);
        var lowLim = parseInt(x - width / 2);
        var upLim = parseInt(x + width / 2);
        for (var i = lowLim; i < upLim; i++) {
          if (grid.isInsideGrid(i, y)) {
            if (!settings.line.bidirectional)
              if (grid.isInsideGrid(i, y + 1))
                if (!(settings.mode == 'pulse' && (cdt < t1 || cdt > T)))
                  grid.Ez[i][y + 1] = 0;

            if (!(settings.mode == 'pulse' && (cdt < t1 || cdt > T)))
              grid.Ez[i][y] = grid.Ez[i][y] + Math.sin(omega * grid.settings.counter * grid.dt);
          }
        }
      }


    } //if(settings)		
  } //put on Grid;



}(jQuery));

window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
  };
})();
