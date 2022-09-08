//PC和移动判断
function IsPC(){  
  var userAgentInfo = navigator.userAgent;
  var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");  
  var flag = true;  
  for (var v = 0; v < Agents.length; v++) {  
      if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }  
  }  
  return flag;  
}


if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
 abc=1;

} else if (/(Android)/i.test(navigator.userAgent)) {
 abc=1;

} else {
 abc=2;

};
//语言切换与产品二级导航兼容
function goto1(){
 document.getElementById("gaishu1").style.zIndex="-1";
}
function goto2(){
 document.getElementById("gaishu1").style.zIndex="1";
}


