'use strict';

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position){
    position = position || 0;
    return this.substr(position, searchString.length) === searchString;
  };
}


(function(){
  var urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
      return null;
    }
    else{
      return decodeURI(results[1]) || 0;
    }
  };


  var defaults = {
    url: "https://mepwatch.eu/",
    cssClass: "mepwatch",
    params: "v,action".split(",")
  };

  var style = function (){
    var style   = document.createElement("style");
    style.type = 'text/css';
    style.id = 'mepwatch-style';
    style.appendChild(document.createTextNode(".mepwatch-act iframe {width:100%;min-width:100%;border:0px;overflow:hidden;}"));
    document.head.appendChild(style);
  }

  var iframe = function () {
    var target = document.querySelector(".mepwatch-act");
    if (!target) return;
//    var me = document.querySelector('script[src="//mepwatch.eu/widget.js"]');
    var iframe = document.createElement('iframe');
    iframe.id = 'mepwatch-iframe';
    var vote=target.dataset.vote || urlParam("v");
    iframe.src = defaults.url + 'widget-act.html?v='+vote;
    iframe.scrolling= 'no';
    target.appendChild(iframe);

  }


  var iframeresizer = function(){

    iFrameResize({
    log:false,
    minHeight:489,
    //heightCalculationMethod:'documentElementOffset',
    heightCalculationMethod:'taggedElement',
    messageCallback : function(d){
      if (d.message.name) {
        document.title=d.message.name;
      }
		}
  }, '#mepwatch-iframe');

  };

  var urlParams = function(opts) {
    opts.params.forEach(function(e){
      if (urlParam(e))
        opts[e] = $.urlParam(e);
    });
  };

  style();
  iframe();
  iframeresizer();
})();
