HUD={}; 
HUD.Properties=function(){
	this.title="";
	this.legend="";
	this.id="";
	this.indexNum=0;
	this.name="";
	this.type="";
	this.value=0;
	this.ROW=1;
	this.COL=1;
	this.isEditable=false;
	this.onchange=null;
};
HUD.TYPE={};
HUD.TYPE.GRID="grid";
HUD.TYPE.INPUT_TEXT="text";
HUD.TYPE.INPUT_RANGE="range";
HUD.TYPE.INPUT_BUTTON="button";

HUD.createTextNode=function(properties){
	var txtNode=document.createElement("textNode");
	txtNode.setAttribute("id",properties.id);
	txtNode.innerHTML=properties.value;
	return txtNode;
};

HUD.createInput=function(properties){
	var input=document.createElement("input");
	input.setAttribute("id",properties.id);
	input.setAttribute("type",properties.type);
	input.setAttribute("indexNum",properties.indexNum);
	input.setAttribute("value",properties.value);
	input.setAttribute("onchange",properties.onchange);
	switch(properties.type){
		case HUD.TYPE.INPUT_TEXT:
			break;
		case HUD.TYPE.INPUT_RANGE:
			break;
		case HUD.TYPE.INPUT_BUTTON:
			break;
	}
	return input;
};
HUD.createComboBox=function(properties){
	var div=document.createElement("div");
	var title=document.createElement("h3");
	var legend=document.createElement("h5");
	title.innerHTML=properties.title;
	legend.innerHTML=properties.legend;
	var select=document.createElement("select");
	select.setAttribute("onchange",properties.onchange);
	for(var i=0; i<properties.value.length; i++){
		var option=document.createElement("option");
		option.setAttribute("value",i);
		option.innerHTML=properties.value[i];
		select.appendChild(option);
	}
	div.appendChild(title);
	div.appendChild(select);
	div.appendChild(legend);
	return div;
};
HUD.createGrid=function(properties){
	var div=document.createElement("div");
	var title=document.createElement("h3");
	var legend=document.createElement("h5");
	title.innerHTML=properties.title;
	legend.innerHTML=properties.legend;
	var table=document.createElement("table");
	table.setAttribute("id",properties.id);
	
	for(var i=0; i<properties.COL; i++){
		var tr=document.createElement("tr");
		for(var j=0; j<properties.ROW; j++){
			var td=document.createElement("td");
			var prop=new HUD.Properties();
			prop.indexNum=i*properties.COL+j;
			prop.id=properties.id+prop.indexNum;
			prop.value=properties.value[prop.indexNum];
			prop.onchange=properties.onchange;
			if(properties.isEditable){
				prop.type=HUD.TYPE.INPUT_TEXT;
				td.appendChild(HUD.createInput(prop));
			}else
				td.appendChild(HUD.createTextNode(prop));
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
	div.appendChild(title);
	div.appendChild(table);
	div.appendChild(legend);
	return div;
};
HUD.addToDocument=function(_node){
	document.body.appendChild(_node);
}
