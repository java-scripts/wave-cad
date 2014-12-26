$('.draggable').draggable();

$('.example').draggable({revert:true});

$(document).contextmenu({
		delegate: ".source,.slab,.monitor",
		preventContextMenuForPopup: true,
		preventSelect: true,
		taphold: true,
		menu: [
			{title: "Delete", cmd: "delete", uiIcon: "ui-icon-trash"},	
		],		
		select: function(event, ui) {
			var $target = ui.target;
			switch(ui.cmd){
			case "delete":
				$target[0].remove();
				break;
			case "copy":
				//to be implimented				
				break;
				}			
		},
		beforeOpen: function(event, ui) {
			//return false, to prevent opening the menu now
			if(!ui.target.parent().attr('id')){
				return false;
			}	
			
		}

	});










function initmaxwell() {


  canvas = document.getElementById("canvas");
  ctx = canvas.getContext('2d');

  container = $('#container').createContainer();
  grid.container = container;
  //grid.sourceContainer=container;
  //grid.slabContainer=container;
  //grid.container=container;


  grid.init();
  updateGridPanel();
  //s1=sourceContainer.createSource({cx:1.22,cy:4.25,mode:'cw'});
  //s1=sourceContainer.createSource({cx:2,cy:2,mode:'cw'});
  //slab=container.createSlab({cx:0.6,cy:4.28,mode:'pulse'});


  //grid.startSimulation();
  //grid.simulation.pause();grid.simulation.refresh();

  //new script....	
	$('#canvas').droppable({
		accept:'.source,.slab, .monitor, .example',
		drop:function(event, ui){			
			var xobject = ui.draggable;
			console.log(xobject[0]);
			if(xobject.hasClass('example')){
				var scriptAreaId = xobject.attr('scriptAreaId');
				executeScript(scriptAreaId);			
			}else{
				if(!xobject.dropped){
				xobject.dropped = true;
				var orginalPosition = xobject.offset();
				xobject.draggable("option", "revert", false);
				xobject.draggable("option", "containment", "#canvas");	
				if(xobject.hasClass('source')){
					$('#source').append(xobject);
				}else if(xobject.hasClass('slab')){
					$('#slab').append(xobject);
				}else if(xobject.hasClass('monitor')){
					$('#monitor').append(xobject);
				}					
				xobject.offset(orginalPosition);
				refillHolder();
				}			
			}		
		}
	});
	refillHolder();
	$('#code-window').droppable({
		accept:'.example',
		drop:function(event, ui){
			var xobject = ui.draggable;
			console.log(xobject[0]);
			var scriptAreaId = xobject.attr('scriptAreaId');
			showScript(scriptAreaId);		
		}		
	});
	
	$('.example').dblclick(function(){
		var scriptAreaId = $(this).attr('scriptAreaId');
		$('#code-window').show();
		showScript(scriptAreaId);	
	})
}




function refillHolder(){
	
	//if closed
	
	$('.holder').each(function(){
		if($(this).children().size()==0){
			var ishidden = false;
			if($(this).closest('.container').is(':hidden')){				
				$(this).closest('.container').show();	
				ishidden = true;		
			}
			
			var profile = $(this).attr('profile');
			var type = $(this).attr('type');	
			if(type=='source'){
			var source = container.createComponent({type:type,profile:profile,});
			}else if(type=='slab'){
			var source = container.createComponent({type:type,profile:profile,width: 0.66, height: 0.39,cx:-10,cy:-10});
			}else if(type=='monitor'){
			var source = container.createComponent({type:type,profile:profile,  width: 0.6, height: 0.28,cx:-10,cy:-10});
			}
			$(this).append(source);
			source.offset($(this).offset());	
			
			if(ishidden){
			$(this).closest('.container').hide();	
			}
		}			
	});

}


$(document).ready(function() {


  $('.btn-src-point').click(function() {
    container.createComponent({
      type: 'source',
      cx: 4.32,
      cy: 3.28
    });
  });
  $('.btn-src-gauss').click(function() {
    container.createComponent({
      type: 'source',
      cx: 4.32,
      cy: 3.28,
      profile: 'gauss'
    });
  });
  $('.btn-src-line').click(function() {
    container.createComponent({
      type: 'source',
      cx: 4.32,
      cy: 3.28,
      profile: 'line'
    });
  });
  $('.btn-slab-rectangle').click(function() {
    container.createComponent({
      type: 'slab',
      cx: 0.3,
      cy: 4.09,
      width: 0.66,
      height: 0.39
    });
  });
  $('.btn-slab-circle').click(function() {
    container.createComponent({
      type: 'slab',
      cx: 0.3,
      cy: 4.09,
      width: 0.66,
      height: 0.39
    });
  });
  $('.btn-slab-triangle').click(function() {
    container.createComponent({
      type: 'slab',
      cx: 0.3,
      cy: 4.09,
      width: 0.66,
      height: 0.39
    });
  });

  $('.btn-monitor-line').click(function() {
    container.createComponent({
      type: 'monitor',
      cx: 1.64,
      cy: 4.13,
      width: 0.6,
      height: 0.28
    });
  });


  $('.btn-icon-play').click(function() {
  	
    grid.simulation.play();
  });
  $('.btn-icon-pause').click(function() {
    grid.simulation.pause();
  });
  $('.btn-icon-refresh').click(function() {
    grid.simulation.refresh();
  });
  
  $('.btn-icon-play-pause').click(function(){
  	
  	var button = $(this);
  	if(button.attr('value') == 'pause'){  	  			
  		button.attr('value','play').children().removeClass('ui-icon-play').addClass('ui-icon-pause');
  		 grid.simulation.play();
  	}else{
  		button.attr('value','pause').children().removeClass('ui-icon-pause').addClass('ui-icon-play');
  		 grid.simulation.pause();
  	}
  });
  $('.btn-icon-onoff').click(function() {
    //grid.#4BE41B red  E41B1B
    var button = $(this);
    if (button.attr('value') == 'off') {
      $('.btn-icon-play-pause').attr('value','play').children().removeClass('ui-icon-play').addClass('ui-icon-pause');
      button.attr('value', 'on').children().removeClass('ui-icon-power').addClass('ui-icon-stop');
      grid.startSimulation();
    } else {
      button.attr('value', 'off').children().removeClass('ui-icon-stop').addClass('ui-icon-power');
      grid.stopSimulation();
      grid.empty();
      grid.init();
      grid.simulation.refresh();
    }
  });
  //updates the active source with the input from panel
  $('.btn-src-update').click(function() {
    updateActiveSourceProps(); //see source props.js for impl
  });
  $('.btn-slab-update').click(function() {
    updateActiveSlabProps(); //see source props.js for impl
  });
  $('.btn-grid-update').click(function() {
    updateGrid();
  });
  $('.btn-monitor-update').click(function() {
    updateActiveMonitorProps();
  });



  //canvas click
  $('#canvas').click(function() {
    $('.active').removeClass('active');
    updatePanel();
    //console.log('clicked on canvas');
  });

  $('').droppable();

  $(".btn-icon-trash").droppable({
    drop: function(event, ui) {
      var activeObj = ui.draggable;
      activeObj.remove();
      updatePanel();
      //if(cobj.hasClass('slab')){			updateSlabs();};				
      console.log(activeObj + 'deleted');
      container.updateSlabs();
	  
    }
  });
});

function openFile() {
  $('#fileopen').click();
}


function loadFileToTextArea(areaId) {
  console.log('File loading to '+areaId);
  var fileToLoad = document.getElementById("fileopen").files[0];

  var fileReader = new FileReader();
  fileReader.onload = function(fileLoadedEvent) {
    var textFromFileLoaded = fileLoadedEvent.target.result;
    document.getElementById(areaId).value = textFromFileLoaded;
    document.getElementById("fileopen").value=""//reset
  };
  fileReader.readAsText(fileToLoad, "UTF-8");

   $('#code-window').show();
}


function getCode() {
  var code = "";
  code += "grid.empty();\n";
  code += "grid.init(" + window.JSON.stringify(grid.settings) + ");\n";
  container.find('.subcontainer').children().each(function() {
    var settings = $(this).get(0).settings;
    code += "container.createComponent(" + window.JSON.stringify(settings) + ");\n"
  });
  code += "grid.startSimulation();";
  return code;
}


function saveAs() {
  document.location = 'data:Application/octet-stream,' + encodeURIComponent(getCode());
}

function showCodeOnTextArea() {
  $('#code-output-area').val(getCode());
}

function showScript(textId){
var code=$('#' + textId).val();
$('#code-output-area').val(code);
}
function executeScript(textId) {
  var code=$('#' + textId).val();
  eval(code);
 //$('#code-output-area').val(code);
}


function maximizeCodeArea() {
  $('#codeWindowModelBody').val($('#code-output-area').val());
 $('#codeWindowModel').modal('show');
}

function minimizeCodeArea() {
    $('#code-output-area').val($('#codeWindowModelBody').val());
    $('#codeWindowModel').modal('hide');
}

function maximizePropsPanelGrid(speed) {
  /*
  $('#props-panel-grid').css('position', 'relative');
  $('#props-panel-grid').animate({
    'width': '780',
    'top': '-25',
    'left': '-720'
  }, speed);
  */
}

function minimizePropsPanelGrid(speed) {
  /*
  $('#props-panel-grid').css('position', 'relative');
  $('#props-panel-grid').animate({
    'width': '300',
    'top': '0',
    'left': '0'
  }, speed);
  */
}



function execute(content) {
  eval(content);
}





function updatePanel(activeObj) {
  $('.active').removeClass('active');

  if (activeObj) {
    this.activeObj = activeObj;
  }

  
  if (activeObj && activeObj.attr('type') == 'source') {
  	$('.props-panel').not('#props-panel-source').slideUp(500);
    $('#props-panel-source').slideDown(500);
    updateSourcePanel(activeObj);
  } else if (activeObj && activeObj.attr('type') == 'slab') {
    $('.props-panel').not('#props-panel-slab').slideUp(500);
    $('#props-panel-slab').slideDown(500);
    updateSlabPanel(activeObj);
  } else if (activeObj && activeObj.attr('type') == 'monitor') {
  	   $('.props-panel').not('#props-panel-monitor').slideUp(500);
    $('#props-panel-monitor').slideDown(500);
    updateMonitorPanel(activeObj);
  } else {
    $('.props-panel').not('#props-panel-grid').slideUp(500);
    $('#props-panel-grid').slideDown(500);
  }
}


function updateSourcePanel(activeObj) {
  var source = activeObj.get(0).settings;

  $('#source-wavelength').val(source.wavelength);
  $('#source-cx').val(parseFloat(source.cx).toFixed(2));
  $('#source-cy').val(parseFloat(source.cy).toFixed(2));

  $('#source-gauss-width').val(source.gauss.width);
  $('#source-line-width').val(source.line.width);

  $('#source-pulse-offTime').val(source.pulse.offTime);
  $('#source-pulse-onTime').val(source.pulse.onTime);

  $('#source-profile-' + source.profile).click();
  $('#source-mode-' + source.mode).click();
  $('#source-gauss-bidirectional-' + source.gauss.bidirectional).click();
  $('#source-line-bidirectional-' + source.line.bidirectional).click();
  $('#source-pulse-repeated-' + source.pulse.repeated).click();
}



function updateActiveSourceProps() {
  var source = activeObj.get(0).settings;

  source.wavelength = $('#source-wavelength').val();
  source.cx = $('#source-cx').val();
  source.cy = $('#source-cy').val();



  source.gauss.width = $('#source-gauss-width').val();
  source.line.width = $('#source-line-width').val();


  source.pulse.offTime = $('#source-pulse-offTime').val();
  source.pulse.onTime = $('#source-pulse-onTime').val();

  source.profile = $('.source-profile:checked').val();

  source.mode = $('.source-mode:checked').val();
  source.gauss.bidirectional = $('.source-gauss-bidirectional:checked').val() == 'true';
  source.line.bidirectional = $('.source-line-bidirectional:checked').val() == 'true';
  source.pulse.repeated = $('.source-pulse-repeated:checked').val() == 'true';


  (activeObj).updateShape();
  activeObj.setPositions();
}



function updateSlabPanel(activeSlab) {
  var settings = activeObj.get(0).settings;

  $('#slab-cx').val(parseFloat(settings.cx).toFixed(2));
  $('#slab-cy').val(parseFloat(settings.cy).toFixed(2));

  $('#slab-width').val(parseFloat(settings.width).toFixed(2));
  $('#slab-height').val(parseFloat(settings.height).toFixed(2));

  $('#slab-eps').val(parseFloat(settings.eps).toFixed(2));
  $('#slab-mu').val(parseFloat(settings.mu).toFixed(2));
  $('#slab-sigma').val(parseFloat(settings.sigma).toFixed(2));
  $('#slab-sigmah').val(parseFloat(settings.sigmah).toFixed(2));

}

function updateMonitorPanel() {
  var settings = activeObj.get(0).settings;

  $('#monitor-cx').val(parseFloat(settings.cx).toFixed(2));
  $('#monitor-cy').val(parseFloat(settings.cy).toFixed(2));
  $('#monitor-width').val(parseFloat(settings.width).toFixed(2));
  $('#monitor-height').val(parseFloat(settings.height).toFixed(2));



  $('#monitor-settings-display-field-' + settings.display.field).click();
  $('#monitor-settings-display-type-' + settings.display.type).click();

  if (settings.display.stroke) $('#monitor-settings-display-stroke').click();
  if (settings.display.fill) $('#monitor-settings-display-fill').click();
  $('#monitor-settings-display-strokeSize').val(settings.display.strokeSize);
  $('#monitor-settings-display-strokeColor').val(settings.display.strokeColor);
  $('#monitor-settings-display-fillColor').val(settings.display.fillColor);

}

function updateActiveMonitorProps() {
  var settings = activeObj.get(0).settings;
  settings.cx = $('#monitor-cx').val();
  settings.cy = $('#monitor-cy').val();
  settings.width = $('#monitor-width').val();
  settings.height = $('#monitor-height').val();

  settings.display.field = $('.monitor-settings-display-field:checked').val();
  settings.display.type = $('.monitor-settings-display-type:checked').val();
  settings.display.stroke = $('#monitor-settings-display-stroke').is(':checked');
  settings.display.strokeSize = $('#monitor-settings-display-strokeSize').val();
  settings.display.strokeColor = $('#monitor-settings-display-strokeColor').val();

  settings.display.fill = $('#monitor-settings-display-fill').is(':checked');
  settings.display.fillColor = $('#monitor-settings-display-fillColor').val();

  console.log(settings.display);

  settings.panel = 'space';
  activeObj.setPositions();
  activeObj.updateSlabs();

}



function updateActiveSlabProps() {
  var settings = activeObj.get(0).settings;
  settings.cx = $('#slab-cx').val();
  settings.cy = $('#slab-cy').val();
  settings.width = $('#slab-width').val();
  settings.height = $('#slab-height').val();
  settings.eps = $('#slab-eps').val()
  settings.mu = $('#slab-mu').val()
  settings.sigma = $('#slab-sigma').val()
  settings.sigmah = $('#slab-sigmah').val();
  settings.panel = 'space';
  activeObj.setPositions();
  activeObj.updateSlabs();
}



function updateGridPanel() {
  var settings = grid.settings;
  $('#grid-xmin').val(settings.xmin);
  $('#grid-xmax').val(settings.xmax);
  $('#grid-ymin').val(settings.ymin);
  $('#grid-ymax').val(settings.ymax);

  $('#grid-Nx').val(settings.Nx);
  $('#grid-Ny').val(settings.Ny);


  $('#grid-pmlWidth').val(settings.pmlWidth);

  $('#grid-settings-eps').val(settings.eps);
  $('#grid-settings-mu').val(settings.mu);
  $('#grid-settings-sigma').val(settings.sigma);
  $('#grid-settings-sigmah').val(settings.sigmah);

  $('#grid-stopTime').val(settings.stopTime);

  $('#grid-dt1').val(grid.dtc);
  $('#grid-dt2').val(parseFloat(grid.dt).toFixed(6));

  $('#grid-launchmode-' + settings.mode).click();

}

function updateGrid() {
  var settings = {};
  settings.xmin = parseInt($('#grid-xmin').val());
  settings.xmax = parseInt($('#grid-xmax').val());
  settings.ymin = parseInt($('#grid-ymin').val());
  settings.ymax = parseInt($('#grid-ymax').val());

  settings.Nx = parseInt($('#grid-Nx').val());
  settings.Ny = parseInt($('#grid-Ny').val());


  settings.pmlWidth = parseInt($('#grid-pmlWidth').val());

  settings.eps = parseFloat($('#grid-settings-eps').val());
  settings.mu = parseFloat($('#grid-settings-mu').val());
  settings.sigma = parseFloat($('#grid-settings-sigma').val());
  settings.sigmah = parseFloat($('#grid-settings-sigmah').val());

  settings.stopTime = parseFloat($('#grid-stopTime').val());
  //settings.dt = parseFloat($('#grid-dt2').val());				

  settings.mode = $('.grid-launchmode:checked').val();
  grid.init(settings);

};

$(document).ready(function() {



  $('#grid-settings-color-hue').change(function() {
    grid.settings.color.hue = parseFloat($(this).val());
  });

  $('#grid-settings-color-saturation').change(function() {
    grid.settings.color.saturation = parseFloat($(this).val());
  });

  $('#grid-settings-color-intensity').change(function() {
    grid.settings.color.intensity = parseFloat($(this).val());
  });

  $('#grid-settings-color-gamma').change(function() {
    grid.settings.color.gamma = parseFloat($(this).val());
  });

  $('#grid-settings-speed').change(function() {
    //console.log('sim speed')
    var simSpeed = parseInt($(this).attr('min')) + parseInt($(this).attr('max')) - parseInt($(this).val());
    grid.simulation.stop();
    grid.simulation.start(simSpeed);
  });
  $('#grid-settings-refreshrate').change(function() {
    grid.settings.display.refreshrate = parseInt($(this).attr('min')) + parseInt($(this).attr('max')) - parseInt($(this).val());
  });


  $('.color-settings-modal').click(function() {
    grid.settings.color.model = parseInt($(this).val());
    if (grid.settings.color.model == 1) {
      grid.settings.color = {
        "model": 1,
        "hue": 0.42,
        "saturation": 0.26,
        "intensity": 1.48,
        "gamma": 1.86
      }
    } else if (grid.settings.color.model == 2) {
      grid.settings.color = {
        "model": 2,
        "hue": 0.59,
        "saturation": 0.32,
        "intensity": 1.53,
        "gamma": 1.46
      };
    } else if (grid.settings.color.model == 3) {
      grid.settings.color = {
        "model": 3,
        "hue": 0.25,
        "saturation": 0.68,
        "intensity": 2,
        "gamma": 2.11
      };
    } else if (grid.settings.color.model == 4) {
      grid.settings.color = {
        "model": 4,
        "hue": 0.66,
        "saturation": 0.79,
        "intensity": 0.95,
        "gamma": 1
      }
    }

  });

  $('.grid-settings-displayField').click(function() {
    grid.settings.display.field = $(this).val();
  });

  $('.grid-settings-display').click(function() {

    grid.settings.display.grid = $('#grid-settings-display-grid').is(':checked');
    grid.settings.display.time = $('#grid-settings-display-time').is(':checked');
    grid.settings.display.axes = $('#grid-settings-display-axes').is(':checked');
    grid.settings.display.pml = $('#grid-settings-display-pml').is(':checked');

    if ($('#grid-settings-display-matrix').is(':checked')) {
      grid.settings.display.matrix = true;
      $('#grid-settings-speed').val(800);
      $('#grid-settings-speed').trigger('change');
    } else {
      grid.settings.display.matrix = false;
      $('#grid-settings-speed').val(1000);
      $('#grid-settings-speed').trigger('change');
    }
  });



});
