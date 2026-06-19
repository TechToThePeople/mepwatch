'use strict';

// Bundle iframe-resizer so it's available as a global
require('iframe-resizer');

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position){
    position = position || 0;
    return this.substr(position, searchString.length) === searchString;
  };
}

const urlParam = function(name){
  const results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (results==null){
    return null;
  }
  else{
    return decodeURI(results[1]) || 0;
  }
};

(function(){

  const defaults = {
    url: "https://mepwatch.eu/9",
    cssClass: "mepwatch",
    params: "v,action".split(",")
  };

  const style = function (){
  let style   = document.createElement("style");
    style.type = 'text/css';
    style.id = 'mepwatch-style';
    style.appendChild(document.createTextNode(".mepwatch-act iframe {width:100%;min-width:100%;border:0px;overflow:hidden;}"));
    style.appendChild(document.createTextNode(".mepwatch-graph iframe {width:100%;min-width:1000px;border:0px;overflow:hidden;}"));
    document.head.appendChild(style);
  };

  const iframe = function () {
  const target = document.querySelector(".mepwatch-act");
    if (!target) return;
  const iframe = document.createElement('iframe');
    iframe.className = 'mepwatch-iframe';
  let vote=target.dataset.vote || urlParam("v");
    iframe.src = defaults.url + 'widget-act.html?v='+vote;
    iframe.scrolling= 'no';
    target.appendChild(iframe);
  };

  const iframeGraph = function () {
  const targets = document.querySelectorAll(".mepwatch-graph");
    if (targets.length == 0) return;
    targets.forEach(function(target){
  const iframe = document.createElement('iframe');
      iframe.className = 'mepwatch-iframe';
      iframe.scrolling= 'no';
  let vote=target.dataset.vote || urlParam("v");
      iframe.src = defaults.url + 'embed.html?v='+vote;
      target.appendChild(iframe);
    });
  };

  const iframeresizer = function(){
    iFrameResize({
      log:false,
      checkOrigin:false,
      minHeight:500,
      messageCallback : function(d){
        if (d.message.name) {
          document.title=d.message.name;
        }
      }
    });
  };

  style();
  iframe();
  iframeGraph();
  iframeresizer();
})();
