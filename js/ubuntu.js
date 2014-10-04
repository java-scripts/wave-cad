 $('#menu ul li').mouseover(function() {
				$('#tooltip-text').text($(this).text());
				$('#tooltip').css("top",$(this).position().top + $('#menu ul').position().top + 45);
				$('#tooltip').show();
	     }).mouseout(function() {
				$('#tooltip').hide();
	     });
		 
		 
$('.tour-guide .next-button, .tour-guide .prev-button').click(function(){
	$(this).parent().find('.container').toggle();
});

$('.select-menu').click(function(e){
	$('.select-menu-options').hide();	
	var	target = $(this).attr('target');
	$(target).show().offset($(this).offset()).offset({top:25});	
});

$('.select-menu-options').click(function(e){
	$(this).hide();
});

function toggleWindow(windowId,launcher){
	var target = $(windowId);	
	if(target.is(':hidden')){
		target.show();		
		$(launcher).find('img').hide();
	}else{
		target.hide();
		$(launcher).find('img').show();
	}

}


function setTimeText(){	
	$('#time p').text(getTimeText());
	window.setTimeout(setTimeText, 60*1000)
}
setTimeText();
	

//time
function getTimeText(){
	var timeText = '';
	var currentTime = new Date()
	var hours = currentTime.getHours()
	var minutes = currentTime.getMinutes()
	if (minutes < 10){
		minutes = "0" + minutes
	}	
	if(hours >= 12){				
		hours-=12;
		timeText = hours + ":" + minutes + " PM";
	}else{
		timeText = hours + ":" + minutes + " PM";
	}
	return timeText;
}











