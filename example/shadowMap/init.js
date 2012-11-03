function turnOffSpot(){
	var val=document.getElementById("spotActivated").getAttribute("value")=="true";
	val=(!val).toString();
	document.getElementById("spotActivated").setAttribute("value",val);
}
x3dom.runtime.ready = function() {
	function init(){
		var cam=document.getElementById("light")._x3domNode;
		var uligthMatrix=document.getElementById("uligthMatrix");

		if(cam._projMatrix){
			var lMPMatrix=cam._projMatrix.mult(cam._viewMatrix);
			uligthMatrix.setAttribute("value",lMPMatrix.transpose().toGL().toString());
			triggeredFunc.shift();
			len=triggeredFunc.length;
		}
	}

	var triggeredFunc=[];
	triggeredFunc.push(init);
	var len=triggeredFunc.length;
	
	var c=0;
	
	document.getElementById("test").runtime.enterFrame = function() {
		//	for(var i=0; i<len; i++)
		//		triggeredFunc[i]();
		init();
			var x=Math.cos(c*3.14/180)*10;
			var y=Math.sin(Math.max(Math.min(c,160),20)*3.14/180)*20;
			var z=10;
			var val=x+' '+y+' '+z;
			
			document.getElementById("light").setAttribute("position",val);
			document.getElementById("light").setAttribute("lookAt","0 0 0");
			document.getElementById("lumPos").setAttribute("value",val);
			document.getElementById("dLumPos").setAttribute("value",val);
			document.getElementById("gizmo").setAttribute("translation",val);
			c++;
			c%=360;
	};
}

