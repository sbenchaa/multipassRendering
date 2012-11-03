// Image Process
IP={};

IP.Filter=function(){
 this.COEF=1;
 this.frame=0;
 this.nbPass=1;
 this.nbPixel=1;
 this.imageSize=512;
 this.kernel=[0,0,0,0,1,0,0,0,0];
};

IP.currentFilter=new IP.Filter();

IP.sendUniform=function (name,val){
 document.getElementById(name).setAttribute("value",val.toString());
};
IP.criteraStart=function(){
 if(IP.currentFilter.frame>1)
  IP.sendUniform("fboB",1);
};
IP.resetCritera=function(){
 IP.currentFilter.frame=0;
 IP.sendUniform("fboB",0);
};

IP.job=function(){
 IP.criteraStart();
 IP.sendUniform("uFrame",IP.currentFilter.frame);
 IP.sendUniform("uPixelSize",
  IP.currentFilter.nbPixel/IP.currentFilter.imageSize
  );
 IP.sendUniform(
  "uKernel",
  [
  IP.currentFilter.kernel[0]/IP.currentFilter.COEF,IP.currentFilter.kernel[1]/IP.currentFilter.COEF,IP.currentFilter.kernel[2]/IP.currentFilter.COEF,
  IP.currentFilter.kernel[3]/IP.currentFilter.COEF,IP.currentFilter.kernel[4]/IP.currentFilter.COEF,IP.currentFilter.kernel[5]/IP.currentFilter.COEF,
  IP.currentFilter.kernel[6]/IP.currentFilter.COEF,IP.currentFilter.kernel[7]/IP.currentFilter.COEF,IP.currentFilter.kernel[8]/IP.currentFilter.COEF
  ]);
 IP.sendUniform("uRenderPass",IP.currentFilter.nbPass);
 IP.currentFilter.frame++;
};
IP.setupFilter=function(node){
 //http://docs.gimp.org/en/plug-in-convmatrix.html
 var f=new IP.Filter();
 switch(parseInt(node.value)){
  case 1:
   f.COEF=1;
   f.kernel=[
   0,-1, 0,
   -1, 5,-1,
   0,-1, 0];
   break;
  case 2:
   f.COEF=9;
   f.kernel=[
   1, 1, 1,
   1, 1, 1,
   1, 1, 1];
   break;
  case 3:
   f.COEF=1;
   f.kernel=[
   0, 0, 0,
   -1, 1, 0,
   0, 0, 0];
   break;
  case 4:
   f.COEF=1;
   f.kernel=[
   0, 1, 0,
   1,-4, 1,
   0, 1, 0];
   break;
  case 5:
   f.COEF=3;
   f.kernel=[
   -2, 1, 0,
   -1, 1, 1,
   0, 1, 2];
   break;
 }
 var arrKernel=document.getElementById("_kernel").querySelectorAll("input");
 for(var i=0; i<arrKernel.length; i++)
  arrKernel[i].setAttribute("value",f.kernel[i]);
	
 document.getElementById("_coef0").setAttribute("value",f.COEF);
 IP.currentFilter=f;
 IP.resetCritera();
};
IP.updateKernel=function(node){
 IP.currentFilter.kernel[node.getAttribute("indexNum")]=parseFloat(node.value);
 IP.resetCritera();
};
IP.updateCoef=function(node){
 IP.currentFilter.COEF=parseFloat(node.value);
 IP.resetCritera();
};
IP.updateNBPass=function(node){
 IP.currentFilter.nbPass=parseFloat(node.value);
 IP.resetCritera();
};

function init(){
 var prop=new HUD.Properties();
 prop.id="_filter";
 prop.title="Prebuilt filters";
 prop.legend="*You can put directly a digit on each text fields.";
 prop.value=["No Filter","Sharpen","Blur","Edge enhance","Edge detect","Emboss"];
 prop.onchange="IP.setupFilter(this)";
 HUD.addToDocument(HUD.createComboBox(prop));

 prop=new HUD.Properties();
 prop.id="_kernel";
 prop.title="Convolution kernel";
 prop.isEditable=true;
 prop.ROW=3;
 prop.COL=3;
 prop.onchange="IP.updateKernel(this)";
 prop.value=IP.currentFilter.kernel;
 HUD.addToDocument(HUD.createGrid(prop));
 prop=new HUD.Properties();
 prop.id="_coef";
 prop.title="Weighting coefficient";
 prop.isEditable=true;
 prop.onchange="IP.updateCoef(this)";
 prop.value=[IP.currentFilter.COEF];
 HUD.addToDocument(HUD.createGrid(prop));
 prop=new HUD.Properties();
 prop.id="_pass";
 prop.title="Number of pass";
 prop.isEditable=true;
 prop.value=[IP.currentFilter.nbPass];
 prop.onchange="IP.updateNBPass(this)";
 HUD.addToDocument(HUD.createGrid(prop));
}

x3dom.runtime.ready = function() {
 init();
 document.getElementById("test").runtime.enterFrame = function() {
  IP.job();
 };
}

