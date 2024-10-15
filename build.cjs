// Import all the libraries
window.iframeResizer = require('iframe-resizer/js/iframeResizer.contentWindow.js');
window.crossfilter = require('crossfilter2');
window.reductio = require('reductio');
window.d3 = require('d3');
window.topojson = require('topojson');
window.d3.tip = require('d3-tip');
window.dc = require('dc');
window.d3.queue = require('d3-queue/build/d3-queue.js').queue;
console.log("queue",d3.queue);
//    'node_modules/d3-queue/build/d3-queue.js',
//      'node_modules/topojson/dist/topojson.js',
//      'node_modules/d3-tip/dist/index.js',

// Use relative path for doT.js
window.doT = require('./node_modules/dot/doT.js');
