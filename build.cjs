// Import all the libraries
window.iframeResizer = require('iframe-resizer/js/iframeResizer.contentWindow.js');
window.crossfilter = require('crossfilter2');
window.reductio = require('reductio');
window.d3 = require('d3');
window.topojson = require('topojson');
window.d3.tip = require('d3-tip');
window.dc = require('dc');
window.d3.queue = require('d3-queue/build/d3-queue.js').queue;
// Use relative path for doT.js
window.doT = require('./node_modules/dot/doT.js');

const polyfill = require('country-flag-emoji-polyfill');
polyfill();
